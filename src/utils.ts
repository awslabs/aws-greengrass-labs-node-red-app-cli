// Copyright 2021 Amazon.com.
// SPDX-License-Identifier: MIT

import archiver from 'archiver';
import * as fspath from 'path';
import * as fs from 'fs';
import tmp from 'tmp';

export async function createNodeModulesArchive(dataFolder: string): Promise<string> {
    return new Promise<string>((res, rej) => {
        try {
            const path = tmp.tmpNameSync({ postfix: '.zip' });
            const resolvedDataPath = fspath.resolve(dataFolder);
            const output = fs.createWriteStream(path);
            output.on('close', () => { res(path) });
            const archive = archiver('zip', { zlib: { level: 9 } });
            archive.pipe(output);
            archive.glob("package.json", { cwd: resolvedDataPath });
            archive.directory(fspath.join(resolvedDataPath, 'node_modules/'), 'node_modules');
            archive.finalize();
        } catch (err) {
            rej(new Error('failed to create artifact for nodes'))
        }
    })
}


export async function createFlowsArchive(dataFolder: string): Promise<string> {
    return new Promise<string>((res, rej) => {
        try {
            const path = tmp.tmpNameSync({ postfix: '.zip' });
            const resolvedDataPath = fspath.resolve(dataFolder);
            const output = fs.createWriteStream(path);
            output.on('close', () => { res(path) });
            const archive = archiver('zip', { zlib: { level: 9 } });
            archive.pipe(output);
            archive.glob("flow*.json", { cwd: resolvedDataPath });
            archive.glob(".config.runtime.json", { cwd: resolvedDataPath });
            archive.finalize();
        } catch (err: any) {
            rej(new Error(err))
        }
    })
}

/**
 * Create a string representation of an object. Support object whose fields 
 * are string, numbers, boolean and arrays
 * 
 * @param o the object to be stringified
 * @returns a string representing the object
 */
export function stringifyObj(o: any): string {
    if (typeof o === 'string') {
        return "\'" + o + "\'";
    }
    if (typeof o !== 'object') {
        return o.toString();
    }
    if (Array.isArray(o)) {
        return '[' + o.map(x => stringifyObj(x)).toString() + ']';
    }
    return '{' + Object.keys(o).map(x => x + ":" + stringifyObj(o[x])).toString() + '}';
}