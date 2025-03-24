import * as vscode from 'vscode';
import { cachedModuleVersions } from './extension';
import { extractModuleVersionsWithLineNumbers } from './moduleParser';
import { updateStatusBar } from './statusBar';

let currentModuleStatuses: Array<{ name: string, version: string, status: string, color?: string, reason?: string }> = [];
export function getCurrentModuleStatuses() {
    return currentModuleStatuses;
}

const diagnosticCollection = vscode.languages.createDiagnosticCollection('modulePolicy');

export async function handleFileEvent(document: vscode.TextDocument) {
    if (!document.fileName.endsWith('.tf')) return;
    await compareWithPolicyAndShowDiagnostics(document);
}

export function clearDiagnostics(uri: vscode.Uri) {
    diagnosticCollection.delete(uri);
}

function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function compareWithPolicyAndShowDiagnostics(document: vscode.TextDocument) {
    if (!cachedModuleVersions) return;

    currentModuleStatuses = [];

    const modules = await extractModuleVersionsWithLineNumbers(document.getText());
    const diagnostics: vscode.Diagnostic[] = [];
    let prohibitedCount = 0, deprecatedCount = 0, versionNotFoundCount = 0, moduleNotFoundCount = 0;

    for (const module of modules) {
        const modulePolicies = cachedModuleVersions[module.name];

        if (!modulePolicies) {
            // Module Not Found
            currentModuleStatuses.push({ 
                name: module.name, 
                version: module.version, 
                status: 'Module not found', 
                color: 'gray',
                reason: 'This module is not listed in the policy.' 
            });

            const line = module.sourceLine !== -1 ? module.sourceLine : module.versionLine;
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(line, 0, line, 100),
                `Module '${module.name}' is not found in the policy.`,
                vscode.DiagnosticSeverity.Warning
            ));

            moduleNotFoundCount++;
            continue;
        }

        const moduleVersionPolicy = modulePolicies[module.version];

        if (!moduleVersionPolicy) {
            // Version Not Found
            currentModuleStatuses.push({ 
                name: module.name, 
                version: module.version,
                status: 'Version not found',
                color: 'dark-red',
                reason: 'This version is not listed in the policy.' 
            });

            const line = module.versionLine !== -1 ? module.versionLine : module.sourceLine;
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(line, 0, line, 100),
                `Version '${module.version}' for module '${module.name}' does not exist. Please check the version.`,
                vscode.DiagnosticSeverity.Error
            ));

            versionNotFoundCount++;
            continue;
        }

        const status = moduleVersionPolicy.status;
        let reason = 'This version is allowed by policy.';
        let color = 'green';

        if (status === 'prohibited') {
            reason = 'This version is explicitly prohibited by policy.';
            color = 'red';
            prohibitedCount++;
        } else if (status === 'divest') {
            reason = 'This version is marked as deprecated.';
            color = 'orange';
            deprecatedCount++;
        }

        currentModuleStatuses.push({ name: module.name, version: module.version, color, status: capitalizeFirstLetter(status), reason });

        if (status === 'prohibited' || status === 'divest') {
            const lineNumber = module.versionLine !== -1 ? module.versionLine : module.sourceLine;
            const message = `Module '${module.name}' version ${module.version} is marked as ${status}.`;
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(lineNumber, 0, lineNumber, 100),
                message,
                status === 'prohibited' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning
            ));
        }
    }

    diagnosticCollection.set(document.uri, diagnostics);
    updateStatusBar(prohibitedCount, deprecatedCount, versionNotFoundCount, moduleNotFoundCount);
}
