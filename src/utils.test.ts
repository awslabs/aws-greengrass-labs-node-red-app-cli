// Copyright 2021 Amazon.com.
// SPDX-License-Identifier: MIT

import * as tmp from "tmp";
import * as path from "path";
import * as fs from "fs";
//import { executeTasks } from '../src/main';
const { createNodeModulesArchive, createFlowsArchive, stringifyObj } = require ('../src/utils');


describe('test', () => {
    it('given an object should return a string representation', () => {
        const o = {a: 'a', b:1, c: [ 1, '3', ['a', 'b']], d: { e: 'x'}}
        const result = stringifyObj(o);
        expect(result).toBe("{a:'a',b:1,c:[1,'3',['a','b']],d:{e:'x'}}");
    })

    it('given a folder containing a node module returns an archive', async () => {
        const d = tmp.dirSync();
        const dataPath = path.join(d.name, 'node_modules')
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

    

})