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
Object.defineProperty(exports, "__esModule", { value: true });
const tmp = __importStar(require("tmp"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
//import { executeTasks } from '../src/main';
const { createNodeModulesArchive, createFlowsArchive, stringifyObj } = require('../src/utils');
describe('test', () => {
    it('given an object should return a string representation', () => {
        const o = { a: 'a', b: 1, c: [1, '3', ['a', 'b']], d: { e: 'x' } };
        const result = stringifyObj(o);
        expect(result).toBe("{a:'a',b:1,c:[1,'3',['a','b']],d:{e:'x'}}");
    });
    it('given a folder containing a node module returns an archive', async () => {
        const d = tmp.dirSync();
        const dataPath = path.join(d.name, 'node_modules');
        fs.mkdirSync(dataPath);
        fs.writeFileSync(path.join(dataPath, 'test.txt'), "Test");
        const result = await createNodeModulesArchive(dataPath);
        expect(fs.existsSync(result)).toBeTruthy();
    });
    it('given a folder containing flows.json returns an archive', async () => {
        const d = tmp.dirSync();
        fs.writeFileSync(path.join(d.name, 'flows.json'), "Test");
        const result = await createFlowsArchive(d.name);
        expect(fs.existsSync(result)).toBeTruthy();
    });
});
//# sourceMappingURL=utils.test%20copy.js.map