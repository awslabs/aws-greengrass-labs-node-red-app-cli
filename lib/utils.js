"use strict";
// Copyright 2021 Amazon.com.
// SPDX-License-Identifier: MIT
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyObj = exports.createFlowsArchive = exports.createNodeModulesArchive = void 0;
const archiver_1 = __importDefault(require("archiver"));
const fspath = __importStar(require("path"));
const fs = __importStar(require("fs"));
const tmp_1 = __importDefault(require("tmp"));
async function createNodeModulesArchive(dataFolder) {
    return new Promise((res, rej) => {
        try {
            const path = tmp_1.default.tmpNameSync({ postfix: '.zip' });
            const resolvedDataPath = fspath.resolve(dataFolder);
            const output = fs.createWriteStream(path);
            output.on('close', () => { res(path); });
            const archive = archiver_1.default('zip', { zlib: { level: 9 } });
            archive.pipe(output);
            archive.glob("package.json", { cwd: resolvedDataPath });
            archive.directory(fspath.join(resolvedDataPath, 'node_modules/'), 'node_modules');
            archive.finalize();
        }
        catch (err) {
            rej(new Error('failed to create artifact for nodes'));
        }
    });
}
exports.createNodeModulesArchive = createNodeModulesArchive;
async function createFlowsArchive(dataFolder) {
    return new Promise((res, rej) => {
        try {
            const path = tmp_1.default.tmpNameSync({ postfix: '.zip' });
            const resolvedDataPath = fspath.resolve(dataFolder);
            const output = fs.createWriteStream(path);
            output.on('close', () => { res(path); });
            const archive = archiver_1.default('zip', { zlib: { level: 9 } });
            archive.pipe(output);
            archive.glob("flow*.json", { cwd: resolvedDataPath });
            archive.glob(".config.runtime.json", { cwd: resolvedDataPath });
            archive.finalize();
        }
        catch (err) {
            rej(new Error(err));
        }
    });
}
exports.createFlowsArchive = createFlowsArchive;
/**
 * Create a string representation of an object. Support object whose fields
 * are string, numbers, boolean and arrays
 *
 * @param o the object to be stringified
 * @returns a string representing the object
 */
function stringifyObj(o) {
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
exports.stringifyObj = stringifyObj;
//# sourceMappingURL=utils.js.map