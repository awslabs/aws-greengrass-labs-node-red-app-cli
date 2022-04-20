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
const main_1 = require("./main");
const types_1 = require("./types");
const fs = __importStar(require("fs"));
const tmp = __importStar(require("tmp"));
const path = __importStar(require("path"));
describe('main test', () => {
    const d = tmp.dirSync();
    const dataPath = path.join(d.name, 'node_modules');
    beforeAll(() => {
        try {
            fs.rmSync('./recipes', { recursive: true });
            fs.rmSync('./artifacts', { recursive: true });
        }
        catch (_a) {
        }
        fs.mkdirSync(dataPath);
        fs.writeFileSync(path.join(dataPath, 'test.txt'), "Test");
        fs.writeFileSync(path.join(dataPath, 'package.json'), "{}");
        fs.writeFileSync(path.join(dataPath, 'package-lock.json'), "{}");
        fs.writeFileSync(path.join(dataPath, 'settings.js'), "{}");
        fs.writeFileSync(path.join(dataPath, '.config.runtime.json'), JSON.stringify({ _credentialSecret: 'aa' }));
    });
    beforeEach(() => {
        //Upload.mockClear();
    });
    it('it create flows and node recipes for container mode', async () => {
        const config = {
            runtime: types_1.Runtime.CONTAINER,
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            dataFolder: dataPath,
        };
        await (0, main_1.executeTasks)(config, true);
        expect(fs.existsSync(`recipes/${config.name}.flows-recipe.yaml`)).toBeTruthy();
        expect(fs.existsSync(`recipes/${config.name}.nodes-recipe.yaml`)).toBeTruthy();
    });
    it('undefined values are treated as false', async () => {
        const config = {
            runtime: types_1.Runtime.CONTAINER,
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            dataFolder: dataPath,
        };
        await (0, main_1.executeTasks)(config, true);
        expect(fs.existsSync(`recipes/${config.name}.flows-recipe.yaml`)).toBeTruthy();
        expect(fs.existsSync(`recipes/${config.name}.nodes-recipe.yaml`)).toBeTruthy();
    });
    it('it create flows and node recipes for npm mode', async () => {
        const config = {
            runtime: types_1.Runtime.NPM,
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            dataFolder: dataPath,
        };
        await (0, main_1.executeTasks)(config, true);
        expect(fs.existsSync(`recipes/${config.name}.flows-recipe.yaml`)).toBeTruthy();
        expect(fs.existsSync(`recipes/${config.name}.nodes-recipe.yaml`)).toBeTruthy();
    });
    it('it add soft and hard dependencies', async () => {
        const config = {
            runtime: types_1.Runtime.NPM,
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            softDependencies: 'aws.greengrass@>1.0.0,aws.lop@0.0.0',
            hardDependencies: 'aws.gre@>1.0.0,aws.rew@0.0.0',
            dataFolder: dataPath,
        };
        await (0, main_1.executeTasks)(config, true);
        expect(fs.existsSync(`recipes/${config.name}.flows-recipe.yaml`)).toBeTruthy();
        expect(fs.existsSync(`recipes/${config.name}.nodes-recipe.yaml`)).toBeTruthy();
    });
    it('it throws when passing invalid soft dependencies', async () => {
        const config = {
            runtime: types_1.Runtime.NPM,
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            softDependencies: 'aws.greengrass,aws.lop@0.0.0',
            hardDependencies: 'aws.gre@>1.0.0,aws.rew@0.0.0',
            dataFolder: dataPath,
        };
        try {
            await (0, main_1.executeTasks)(config, true);
            expect(true).toBeFalsy();
        }
        catch (_a) {
            expect(true).toBeTruthy();
        }
    });
    it('it throws when passing invalid soft dependencies /2', async () => {
        const config = {
            runtime: types_1.Runtime.NPM,
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            softDependencies: 'aws.greengrass@,aws.lop@0.0.0',
            hardDependencies: 'aws.gre@>1.0.0,aws.rew@0.0.0',
            dataFolder: dataPath,
        };
        try {
            await (0, main_1.executeTasks)(config, true);
            expect(true).toBeFalsy();
        }
        catch (_a) {
            expect(true).toBeTruthy();
        }
    });
    it('it throws when passing invalid soft dependencies /3', async () => {
        const config = {
            runtime: types_1.Runtime.NPM,
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            softDependencies: '@1.2.3,aws.lop@0.0.0',
            hardDependencies: 'aws.gre@>1.0.0,aws.rew@0.0.0',
            dataFolder: dataPath,
        };
        try {
            await (0, main_1.executeTasks)(config, true);
            expect(true).toBeFalsy();
        }
        catch (_a) {
            expect(true).toBeTruthy();
        }
    });
    it('it throws when passing invalid hard dependencies', async () => {
        const config = {
            runtime: types_1.Runtime.NPM,
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            softDependencies: '',
            hardDependencies: 'aws.gre,aws.rew@0.0.0',
            dataFolder: dataPath,
        };
        try {
            await (0, main_1.executeTasks)(config, true);
            expect(true).toBeFalsy();
        }
        catch (_a) {
            expect(true).toBeTruthy();
        }
    });
    it('it throws when passing invalid hard dependencies /2', async () => {
        const config = {
            runtime: types_1.Runtime.NPM,
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            softDependencies: '',
            hardDependencies: 'aws.gre@,aws.rew@0.0.0',
            dataFolder: dataPath,
        };
        try {
            await (0, main_1.executeTasks)(config, true);
            expect(true).toBeFalsy();
        }
        catch (_a) {
            expect(true).toBeTruthy();
        }
    });
    it('it throws when passing invalid hard dependencies /3', async () => {
        const config = {
            runtime: types_1.Runtime.NPM,
            author: 'Me',
            name: 'base',
            version: '1.0.0',
            softDependencies: '',
            hardDependencies: '@ewe,aws.rew@0.0.0',
            dataFolder: dataPath,
        };
        try {
            await (0, main_1.executeTasks)(config, true);
            expect(true).toBeFalsy();
        }
        catch (_a) {
            expect(true).toBeTruthy();
        }
    });
    it('run creates a nodes.zip artifact', async () => {
        const config = {
            runtime: types_1.Runtime.CONTAINER,
            prepackageDeps: true,
            name: 'base',
            version: '1.0.0',
            dataFolder: dataPath,
        };
        await (0, main_1.executeTasks)(config, true);
        expect(fs.existsSync(`recipes/${config.name}.flows-recipe.yaml`));
        expect(fs.existsSync(`artifacts/${config.name}.nodes/nodes.zip`));
    });
});
//# sourceMappingURL=main.test.js.map