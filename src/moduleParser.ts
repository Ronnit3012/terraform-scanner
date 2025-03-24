import { parse as hcl2json } from '@cdktf/hcl2json';

export async function extractModuleVersionsWithLineNumbers(content: string) {
    const parsedData = await hcl2json('main.tf', content);
    const lines = content.split('\n');

    const modules = [];
    if (parsedData.module) {
        for (const [name, moduleArray] of Object.entries(parsedData.module)) {
            const module = Array.isArray(moduleArray) ? moduleArray[0] : moduleArray;
            if (module.source && module.version) {
                modules.push({
                    name: extractModuleNameFromSource(module.source),
                    version: module.version,
                    source: module.source,
                    sourceLine: findLineContaining(lines, module.source),
                    versionLine: findLineContaining(lines, module.version)
                });
            }
        }
    }

    return modules;
}

function extractModuleNameFromSource(source: string): string {
    const parts = source.split('/');
    return parts[parts.length - 2] ?? source;
}

function findLineContaining(lines: string[], text: string) {
    return lines.findIndex(line => line.includes(text));
}
