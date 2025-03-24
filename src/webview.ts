import * as vscode from 'vscode';
// import { cachedModuleVersions } from './extension';
import { getCurrentModuleStatuses } from './diagnostics';

let modulePolicyPanel: vscode.WebviewPanel | undefined;

export function showModulePolicyDetails() {
    if (modulePolicyPanel) {
        // If the panel already exists, reveal it in the second column (split view)
        modulePolicyPanel.reveal(vscode.ViewColumn.Beside);
    } else {
        // Create a new panel
        modulePolicyPanel = vscode.window.createWebviewPanel(
            'modulePolicyDetails',
            'Module Policy Details',
            vscode.ViewColumn.Beside, // Opens in split view
            {
                enableScripts: true, // Enable scripts in the webview
                retainContextWhenHidden: true, // Optional: Keeps the webview alive when hidden
                enableCommandUris: true,
            }
        );

        // Set the HTML content for your webview
        modulePolicyPanel.webview.html = generatePolicyDetailsHTML();

        // Handle panel disposal
        modulePolicyPanel.onDidDispose(() => {
            modulePolicyPanel = undefined;
        });
    }
}

// function capitalizeFirstLetter(str: string) {
//     return str.charAt(0).toUpperCase() + str.slice(1);
// }

const iconMap = {
    red: '❌',
    orange: '⚠️',
    green: '✅',
    gray: '🔍',
    "dark-red": '🚫'
};

function generatePolicyDetailsHTML() {
    const modules = getCurrentModuleStatuses();

    const rows = modules.map(module => {
        const { name, version, status, color, reason } = module;
        const icon = iconMap[color as keyof typeof iconMap] || '❓';
        // const className = status === 'prohibited' ? 'prohibited' : status === 'divest' ? 'divest' : 'safe';
        // const icon = color === 'red' ? '❌' : color === 'orange' ? '⚠️' : color === 'gray' ? '🔍' : '✅';

        return `
            <tr>
                <td>${name}</td>
                <td>${version}</td>
                <td class="${color}">
                    <span class="icon">${icon}</span>
                    ${status}
                </td>
                <td>${reason || '-'}</td>
            </tr>
        `;
    }).join('');

    return `
        <!DOCTYPE html>
        <html lang="en" data-vscode-theme>
        <head>
            <style>
                body {
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    font-family: var(--vscode-font-family, 'Segoe UI', sans-serif);
                    padding: 20px;
                    margin: 0;
                }

                h2 {
                    border-bottom: 3px solid var(--vscode-editor-lineHighlightBackground);
                    padding-bottom: 5px;
                }

                /* Table Styles */
                table {
                    width: 100%;
                    border-collapse: collapse;
                    background-color: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-editorWidget-border);
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                }

                th, td {
                    padding: 10px 15px;
                    border: 1px solid var(--vscode-editorWidget-border);
                    text-align: left;
                }

                th {
                    background-color: var(--vscode-editorWidget-background);
                    color: var(--vscode-editor-foreground);
                }

                tbody tr:nth-child(odd) {
                    background-color: var(--vscode-sideBar-background);
                }

                tbody tr:nth-child(even) {
                    background-color: var(--vscode-editor-background);
                }

                /* Status Styles */
                .safe {
                    color: var(--vscode-terminal-ansiGreen);
                    font-weight: bold;
                }

                .divest {
                    color: var(--vscode-terminal-ansiYellow);
                    font-weight: bold;
                }

                .prohibited {
                    color: var(--vscode-terminal-ansiRed);
                    font-weight: bold;
                }

                .not-found {
                    color: var(--vscode-editorUnnecessaryCode-opacity);
                    font-weight: bold;
                }

                .version-not-found {
                    color: var(--vscode-errorForeground);
                    font-weight: bold;
                }

                .reason {
                    color: var(--vscode-descriptionForeground);
                    font-style: italic;
                }
            </style>
        </head>
        <body>
            <h2>Module Policy Details</h2>
            <table>
                <thead>
                    <tr>
                        <th>Module</th>
                        <th>Version</th>
                        <th>Status</th>
                        <th>Reason</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </body>
        </html>
    `;
}


    function getModulePolicyHtml(): string {
        throw new Error('Function not implemented.');
    }
// function generatePolicyDetailsHTML(): string {
//     if (!cachedModuleVersions) {
//         return `<h3>No module versions policy found.</h3>`;
//     }

//     // const rows = Object.entries(cachedModuleVersions).map(([name, versions]) => `
//     //     <tr>
//     //         <td>${name}</td>
//     //         <td>${versions.prohibited.join(', ') || '-'}</td>
//     //         <td>${versions.deprecated.join(', ') || '-'}</td>
//     //     </tr>
//     // `).join('');

//     // return `
//     //     <html><body>
//     //     <h2>Module Policy Details</h2>
//     //     <table border="1">
//     //         <tr><th>Module</th><th>Prohibited Versions</th><th>Deprecated Versions</th></tr>
//     //         ${rows}
//     //     </table>
//     //     </body></html>
//     // `;

//     const rows = Object.entries(cachedModuleVersions).map(([moduleName, versions]) =>
//         Object.entries(versions).map(([version, details]) => `
//             <tr>
//                 <td>${moduleName}</td>
//                 <td>${version}</td>
//                 <td class="${details.status === 'prohibited' ? 'prohibited' : details.status === 'divest' ? 'divest' : 'safe'}">${capitalizeFirstLetter(details.status)}</td>
//             </tr>
//         `).join('')
//     ).join('');
    

//     return ` 
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//             <style>
//                 table { border-collapse: collapse; }
//                 th, td { border: 1px solid #ddd; padding: 8px 16px; text-align: left; }
//                 th { background-color: #f4f4f4; }
//                 .safe { color: green; }
//                 .divest { color: orange; }
//                 .prohibited { color: red; }
//             </style>
//         </head>
//         <body>
//             <h2>Module Policy Details</h2>
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Module</th>
//                         <th>Version</th>
//                         <th>Status</th>
//                     </tr>
//                 </thead>
//                 <tbody>${rows}</tbody>
//             </table>
//         </body>
//         </html>
//     `;
// }


// function getPolicyDetailsHtml() {
//     const modules = getCurrentModuleStatuses();

//     const rows = modules.map(m => `
//         <tr>
//             <td>${m.name}</td>
//             <td>${m.version}</td>
//             <td>${m.status}</td>
//             <td>${m.reason || '-'}</td>
//         </tr>
//     `).join('');

//     return `
//         <!DOCTYPE html>
//         <html lang="en">
//         <head>
//             <style>
//                 table { width: 100%; border-collapse: collapse; }
//                 th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//                 th { background-color: #f4f4f4; }
//                 .safe { color: green; }
//                 .deprecated { color: orange; }
//                 .prohibited { color: red; }
//             </style>
//         </head>
//         <body>
//             <h2>Module Policy Details</h2>
//             <table>
//                 <thead>
//                     <tr>
//                         <th>Module</th>
//                         <th>Version</th>
//                         <th>Status</th>
//                         <th>Reason</th>
//                     </tr>
//                 </thead>
//                 <tbody>${rows}</tbody>
//             </table>
//         </body>
//         </html>
//     `;
// }
