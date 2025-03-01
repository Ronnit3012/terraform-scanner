import * as vscode from 'vscode';
import { cachedModuleVersions } from './extension';
import { extractModuleVersionsWithLineNumbers } from './moduleParser';
import { updateStatusBar } from './statusBar';

const diagnosticCollection = vscode.languages.createDiagnosticCollection('modulePolicy');

export async function handleFileEvent(document: vscode.TextDocument) {
    if (!document.fileName.endsWith('.tf')) return;
    await compareWithPolicyAndShowDiagnostics(document);
}

export function clearDiagnostics(uri: vscode.Uri) {
    diagnosticCollection.delete(uri);
}

async function compareWithPolicyAndShowDiagnostics(document: vscode.TextDocument) {
    if (!cachedModuleVersions) return;

    const modules = await extractModuleVersionsWithLineNumbers(document.getText());
    const diagnostics: vscode.Diagnostic[] = [];
    let prohibitedCount = 0, deprecatedCount = 0;

    for (const module of modules) {
        const policy = cachedModuleVersions[module.name];
        if (!policy) continue;

        let status: 'safe' | 'deprecated' | 'prohibited' = 'safe';
        if (policy.prohibited.includes(module.version)) {
            status = 'prohibited';
            prohibitedCount++;
        } else if (policy.deprecated.includes(module.version)) {
            status = 'deprecated';
            deprecatedCount++;
        }

        if (status !== 'safe') {
            const lineNumber = module.versionLine ?? module.sourceLine;
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(lineNumber, 0, lineNumber, 100),
                `Module '${module.name}' version ${module.version} is ${status}.`,
                status === 'prohibited' ? vscode.DiagnosticSeverity.Error : vscode.DiagnosticSeverity.Warning
            ));
        }
    }

    diagnosticCollection.set(document.uri, diagnostics);
    updateStatusBar(prohibitedCount, deprecatedCount);
}
