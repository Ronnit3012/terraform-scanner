import * as vscode from 'vscode';
import { exec } from 'child_process';
import { extractModuleVersionsWithLineNumbers } from './moduleParser';
import { cachedModuleVersions } from './extension';

// Output Channel for the scan results
const outputChannel = vscode.window.createOutputChannel('Module Policy Scan');

// Status Bar Button
let scanStatusBarItem: vscode.StatusBarItem;

/**
 * Initializes the Git Scanner - adds status bar item for scanning.
 */
export function initializeGitScanner(context: vscode.ExtensionContext) {
    scanStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    scanStatusBarItem.text = '$(search) Scan Staged Modules';
    scanStatusBarItem.tooltip = 'Scan staged Terraform files for policy violations';
    scanStatusBarItem.command = 'modulePolicy.scanStagedFiles';
    context.subscriptions.push(scanStatusBarItem);

    context.subscriptions.push(vscode.commands.registerCommand('modulePolicy.scanStagedFiles', scanStagedFilesForModuleViolations));

    scanStatusBarItem.show();
}

/**
 * Runs 'git diff --name-only --cached' to get staged files.
 */
function getStagedFiles(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            return reject(new Error("No workspace folder found."));
        }

        exec('git diff --name-only --cached', { cwd: workspaceFolder }, (err, stdout) => {
            if (err) {
                return reject(new Error(`Failed to run git command: ${err.message}`));
            }
            const files = stdout.trim().split('\n').filter(f => f);
            resolve(files);  // These are already relative to workspace root
        });
    });
}

/**
 * Scans staged .tf files for module version violations.
 */
export async function scanStagedFilesForModuleViolations() {
    outputChannel.clear();
    outputChannel.show(true);
    outputChannel.appendLine(`🔎 Scanning staged files for Module Policy violations...\n`);

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
        vscode.window.showErrorMessage(`No workspace folder detected.`);
        return;
    }

    let stagedFiles: string[];
    try {
        stagedFiles = await getStagedFiles();
    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to scan staged files: ${error.message}`);
        return;
    }

    const tfFiles = stagedFiles.filter(file => file.endsWith('.tf'));

    if (tfFiles.length === 0) {
        outputChannel.appendLine(`✅ No .tf files are staged. Nothing to check.`);
        return;
    }

    for (const relativePath of tfFiles) {
        const absolutePath = vscode.Uri.file(`${workspaceFolder}/${relativePath}`).fsPath;

        try {
            const document = await vscode.workspace.openTextDocument(vscode.Uri.file(absolutePath));
            const content = document.getText();
            const modules = await extractModuleVersionsWithLineNumbers(content);

            outputChannel.appendLine(`📄 ${relativePath}:`);
            if (modules.length === 0) {
                outputChannel.appendLine(`   🟢 No modules detected.`);
                continue;
            }

            let fileSafe = true;

            for (const module of modules) {
                const policy = cachedModuleVersions?.[module.name];

                if (!policy) {
                    // outputChannel.appendLine(`   ⚪ Line ${module.versionLine + 1}: Module '${module.name}' not found.`);
                    outputChannel.appendLine(`   ❓ Line ${module.versionLine + 1}: Module '${module.name}' has no policy defined.`);
                    fileSafe = false;
                    continue;
                }

                if (!policy[module.version]) {
                    outputChannel.appendLine(`   ❗ Line ${module.versionLine + 1}: Version '${module.version}' for '${module.name}' not found.`);
                    fileSafe = false;
                    continue;
                }

                if (policy[module.version]?.status === 'prohibited') {
                    outputChannel.appendLine(`   ❌ Line ${module.versionLine + 1}: '${module.name}' uses prohibited version '${module.version}'.`);
                    fileSafe = false;
                } else if (policy[module.version]?.status === 'divest') {
                    outputChannel.appendLine(`   ⚠️ Line ${module.versionLine + 1}: '${module.name}' uses deprecated version '${module.version}'.`);
                    fileSafe = false;
                }
            }

            if (fileSafe) {
                outputChannel.appendLine(`   ✅ All modules are compliant.`);
            }

        } catch (error: any) {
            outputChannel.appendLine(`❗ Failed to process file: ${relativePath}`);
            outputChannel.appendLine(`   Error: ${error.message}`);
        }

        outputChannel.appendLine('');
    }

    outputChannel.appendLine(`🔍 Scan complete.`);
}
