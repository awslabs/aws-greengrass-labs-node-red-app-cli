// Copyright 2021 Amazon.com.
// SPDX-License-Identifier: MIT

import { executeTasks } from "./main";
import { Options, Runtime } from "./types";
import * as fs from "fs";
import * as tmp from "tmp";
import * as path from "path";


describe('main test', () => {
    const d = tmp.dirSync();
    const dataPath = path.join(d.name, 'node_modules')


    beforeAll(() => {
        try {
            fs.rmSync('./recipes', { recursive: true });
            fs.rmSync('./artifacts', { recursive: true });
        } catch {

        }
        fs.mkdirSync(dataPath);
        fs.writeFileSync(path.join(dataPath, 'test.txt'), "Test");
        fs.writeFileSync(path.join(dataPath, 'package.json'), "{}");
        fs.writeFileSync(path.join(dataPath, 'package-lock.json'), "{}");
        fs.writeFileSync(path.join(dataPath, 'settings.js'), "{}");
        fs.writeFileSync(path.join(dataPath, '.config.runtime.json'), JSON.stringify({ _credentialSecret: 'aa' }));
    })

    beforeEach(() => {
        //Upload.mockClear();
    });

    it('it create flows and node recipes for container mode', async () => {
        const config: Options = {
            runtime: Runtime.CONTAINER,
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            dataFolder: dataPath,
        }

        await executeTasks(config, true);
        expect(fs.existsSync(`recipes/${config.name}.flows-recipe.yaml`)).toBeTruthy();
        expect(fs.existsSync(`recipes/${config.name}.nodes-recipe.yaml`)).toBeTruthy();
    });

    it('undefined values are treated as false', async () => {
        const config: Options = {
            runtime: Runtime.CONTAINER,
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            dataFolder: dataPath,
        }

        await executeTasks(config, true);
        expect(fs.existsSync(`recipes/${config.name}.flows-recipe.yaml`)).toBeTruthy();
        expect(fs.existsSync(`recipes/${config.name}.nodes-recipe.yaml`)).toBeTruthy();
    });

    it('it create flows and node recipes for npm mode', async () => {
        const config: Options = {      
            runtime: Runtime.NPM,      
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            dataFolder: dataPath,

        }

        await executeTasks(config, true);
        expect(fs.existsSync(`recipes/${config.name}.flows-recipe.yaml`)).toBeTruthy();
        expect(fs.existsSync(`recipes/${config.name}.nodes-recipe.yaml`)).toBeTruthy();
    });
    
    it('it add soft and hard dependencies', async () => {
        const config: Options = {      
            runtime: Runtime.NPM,      
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            softDependencies: 'aws.greengrass@>1.0.0,aws.lop@0.0.0',
            hardDependencies: 'aws.gre@>1.0.0,aws.rew@0.0.0',
            dataFolder: dataPath,

        }

        await executeTasks(config, true);
        expect(fs.existsSync(`recipes/${config.name}.flows-recipe.yaml`)).toBeTruthy();
        expect(fs.existsSync(`recipes/${config.name}.nodes-recipe.yaml`)).toBeTruthy();
    });

    it('it throws when passing invalid soft dependencies', async () => {
        const config: Options = {      
            runtime: Runtime.NPM,      
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            softDependencies: 'aws.greengrass,aws.lop@0.0.0',
            hardDependencies: 'aws.gre@>1.0.0,aws.rew@0.0.0',
            dataFolder: dataPath,

        }
        
        try {
            await executeTasks(config, true);
            expect(true).toBeFalsy();
        } catch {
            expect(true).toBeTruthy()
        }
    });

    it('it throws when passing invalid soft dependencies /2', async () => {
        const config: Options = {      
            runtime: Runtime.NPM,      
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            softDependencies: 'aws.greengrass@,aws.lop@0.0.0',
            hardDependencies: 'aws.gre@>1.0.0,aws.rew@0.0.0',
            dataFolder: dataPath,

        }
        
        try {
            await executeTasks(config, true);
            expect(true).toBeFalsy();
        } catch {
            expect(true).toBeTruthy()
        }
    });

    it('it throws when passing invalid soft dependencies /3', async () => {
        const config: Options = {      
            runtime: Runtime.NPM,      
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            softDependencies: '@1.2.3,aws.lop@0.0.0',
            hardDependencies: 'aws.gre@>1.0.0,aws.rew@0.0.0',
            dataFolder: dataPath,

        }
        
        try {
            await executeTasks(config, true);
            expect(true).toBeFalsy();
        } catch {
            expect(true).toBeTruthy()
        }
    });

    it('it throws when passing invalid hard dependencies', async () => {
        const config: Options = {      
            runtime: Runtime.NPM,      
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            softDependencies: '',
            hardDependencies: 'aws.gre,aws.rew@0.0.0',
            dataFolder: dataPath,

        }
        try {
            await executeTasks(config, true);
            expect(true).toBeFalsy();
        } catch {
            expect(true).toBeTruthy()
        }
    });

    it('it throws when passing invalid hard dependencies /2', async () => {
        const config: Options = {      
            runtime: Runtime.NPM,      
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            softDependencies: '',
            hardDependencies: 'aws.gre@,aws.rew@0.0.0',
            dataFolder: dataPath,

        }
        try {
            await executeTasks(config, true);
            expect(true).toBeFalsy();
        } catch {
            expect(true).toBeTruthy()
        }
    });
    it('it throws when passing invalid hard dependencies /3', async () => {
        const config: Options = {      
            runtime: Runtime.NPM,      
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            softDependencies: '',
            hardDependencies: '@ewe,aws.rew@0.0.0',
            dataFolder: dataPath,

        }
        try {
            await executeTasks(config, true);
            expect(true).toBeFalsy();
        } catch {
            expect(true).toBeTruthy()
        }
    });

    it('run creates a nodes.zip artifact', async () => {
        const config: Options = {
            runtime: Runtime.CONTAINER,
            prepackageDeps: true,
            name: 'base',
            version: '1.0.0',
            dataFolder: dataPath,
        }

        await executeTasks(config, true);
        expect(fs.existsSync(`recipes/${config.name}.flows-recipe.yaml`));
        expect(fs.existsSync(`artifacts/${config.name}.nodes/nodes.zip`));
    });
    
})