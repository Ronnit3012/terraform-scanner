import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;
// let scanStatusBarItem: vscode.StatusBarItem;

export function initializeStatusBar(context: vscode.ExtensionContext) {
    // Existing status bar (right side) for module policy
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'modulePolicy.showDetails';

    // New status bar (left side) for scanning staged files
    // scanStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    // scanStatusBarItem.text = '$(search) Scan Staged Files';
    // scanStatusBarItem.tooltip = 'Scan staged files for prohibited/deprecated modules';
    // scanStatusBarItem.command = 'modulePolicy.scanStagedFiles';

    // context.subscriptions.push(statusBarItem, scanStatusBarItem);
    context.subscriptions.push(statusBarItem);

    statusBarItem.show();
}

export function updateStatusBar(prohibited: number, deprecated: number) {
    if (prohibited === 0 && deprecated === 0) {
        statusBarItem.text = `$(check) All Modules Safe`;
        statusBarItem.tooltip = `All modules comply with policy.`;
        statusBarItem.color = new vscode.ThemeColor('terminal.ansiGreen');
    } else {
        const parts = [];
        if (prohibited > 0) {
            parts.push(`$(error) ${prohibited} Prohibited`);
            statusBarItem.color = new vscode.ThemeColor('errorForeground');
        }
        if (deprecated > 0) {
            parts.push(`$(warning) ${deprecated} Deprecated`);
            if (prohibited === 0) statusBarItem.color = new vscode.ThemeColor('terminal.ansiYellow');
        }
        statusBarItem.text = parts.join('  ');
        statusBarItem.tooltip = `Click to view policy details for ${prohibited + deprecated} module(s).`;
    }
    statusBarItem.show();
}

export function hideStatusBar() {
    statusBarItem.hide();
}

export function showStatusBar() {
    statusBarItem.show();
}