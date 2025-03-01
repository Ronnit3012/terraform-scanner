import * as vscode from 'vscode';
import axios from 'axios';

export async function fetchModuleVersions(apiUrl: string) {
    try {
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to fetch module versions: ${error.message}`);
        return {};
    }
}
