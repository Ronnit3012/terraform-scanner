import * as vscode from 'vscode';
import { initializeStatusBar, updateStatusBar, hideStatusBar, showStatusBar } from './statusBar';
import { fetchModuleVersions } from './policyFetcher';
import { handleFileEvent, clearDiagnostics } from './diagnostics';
import { showModulePolicyDetails } from './webview';
import { initializeGitScanner } from './gitScanner';

export let cachedModuleVersions: Record<string, Record<string, { status: 'invest' | 'divest' | 'prohibited' }>> | null = null;

const MODULE_VERSIONS_API = "http://localhost:8000/module-versions";

export async function activate(context: vscode.ExtensionContext) {
    cachedModuleVersions = null;
    console.log("Cache cleared on extension activation.");

    initializeStatusBar(context);
    initializeGitScanner(context);

    // Fetch module versions policy from the API
    context.subscriptions.push(vscode.languages.createDiagnosticCollection('modulePolicy'));
    
    // Scan staged files for module violations
    // context.subscriptions.push(vscode.commands.registerCommand('modulePolicy.scanStagedFiles', scanStagedFilesForModuleViolations));


    cachedModuleVersions = await fetchModuleVersions(MODULE_VERSIONS_API);

    vscode.workspace.onDidOpenTextDocument(handleFileEvent);
    vscode.workspace.onDidSaveTextDocument(handleFileEvent);
    vscode.workspace.onDidCloseTextDocument(doc => clearDiagnostics(doc.uri));

    let lastTfFile: vscode.TextDocument | null = null;

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document.fileName.endsWith('.tf')) {
            lastTfFile = editor.document;
            handleFileEvent(editor.document);
        } else if (editor && editor.document.uri.scheme === 'output') {
            // When output channel opens, just show the status bar without scanning a new file.
            if (lastTfFile) {
                showStatusBar();
            }
        } else {
            hideStatusBar();
        }
    });


    // vscode.window.onDidChangeActiveTextEditor(editor => {
    //     if (editor && editor.document.fileName.endsWith('.tf')) {
    //         handleFileEvent(editor.document);
    //     } else {
    //         hideStatusBar();
    //     }
    // });

    if (vscode.workspace.workspaceFolders) {
        for (const folder of vscode.workspace.workspaceFolders) {
            const tfFiles = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, '**/*.tf'));
            for (const file of tfFiles) {
                const doc = await vscode.workspace.openTextDocument(file);
                await handleFileEvent(doc);
            }
        }
    }

    context.subscriptions.push(vscode.commands.registerCommand('modulePolicy.showDetails', showModulePolicyDetails));

    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.fileName.endsWith('.tf')) {
        await handleFileEvent(activeEditor.document);
    } else {
        hideStatusBar();
    }
}

export function deactivate() {
    vscode.languages.getDiagnostics().forEach(([uri]) => clearDiagnostics(uri));
    hideStatusBar();
}