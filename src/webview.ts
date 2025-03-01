import * as vscode from 'vscode';
import { cachedModuleVersions } from './extension';

export function showModulePolicyDetails() {
    const panel = vscode.window.createWebviewPanel(
        'modulePolicyDetails',
        'Module Policy Details',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );
    panel.webview.html = generatePolicyDetailsHTML();
}

function generatePolicyDetailsHTML(): string {
    if (!cachedModuleVersions) {
        return `<h3>No module versions policy found.</h3>`;
    }

    const rows = Object.entries(cachedModuleVersions).map(([name, versions]) => `
        <tr>
            <td>${name}</td>
            <td>${versions.prohibited.join(', ') || '-'}</td>
            <td>${versions.deprecated.join(', ') || '-'}</td>
        </tr>
    `).join('');

    return `
        <html><body>
        <h2>Module Policy Details</h2>
        <table border="1">
            <tr><th>Module</th><th>Prohibited Versions</th><th>Deprecated Versions</th></tr>
            ${rows}
        </table>
        </body></html>
    `;
}


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
