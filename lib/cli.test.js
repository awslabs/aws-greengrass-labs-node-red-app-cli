"use strict";
// Copyright 2021 Amazon.com.
// SPDX-License-Identifier: MIT
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("./cli");
describe('test', () => {
    it('GIVEN default params and no deploy or upload SHOULD return the right object', async () => {
        const result = await (0, cli_1.cli)(['node', 'index',
            '-rt', 'container',
            '-rv', '2.1.3',
            '-d', 'data',
            '-n', 'test.aws',
            '-a', 'me',
            '-v', '1.0.1',
            '--softDependencies', 'test@1.2.3',
            '--hardDependencies', '',
            '--no-prepackageDeps',
        ], {});
        expect(result).toStrictEqual({
            runtime: 'container',
            dataFolder: 'data',
            name: 'test.aws',
            author: 'me',
            version: '1.0.1',
            runtimeVersion: "2.1.3",
            softDependencies: 'test@1.2.3',
            hardDependencies: '',
            prepackageDeps: false
        });
    });
    it('GIVEN additional user and pwd SHOULD return the right object', async () => {
        const result = await (0, cli_1.cli)(['node', 'index',
            '-rt', 'container',
            '-rv', '2.1.3',
            '-d', 'data',
            '-n', 'test.aws',
            '-a', 'me',
            '-v', '1.0.1',
            '--no-prepackageDeps',
            '--softDependencies', '',
            '--hardDependencies', '',
        ], {});
        expect(result).toStrictEqual({
            runtime: 'container',
            dataFolder: 'data',
            name: 'test.aws',
            author: 'me',
            version: '1.0.1',
            runtimeVersion: "2.1.3",
            prepackageDeps: false,
            softDependencies: '',
            hardDependencies: '',
        });
    });
    it('GIVEN it uses npm and deploys it IT SHOULD not require runAsUser', async () => {
        const result = await (0, cli_1.cli)(['node', 'index',
            '-rt', 'npm',
            '-rv', '2.1.3',
            '-d', 'data',
            '-n', 'test.aws',
            '-a', 'me',
            '-v', '1.0.1',
            '--no-prepackageDeps',
            '--softDependencies', '',
            '--hardDependencies', '',
        ], {});
        expect(result).toStrictEqual({
            runtime: 'npm',
            dataFolder: 'data',
            name: 'test.aws',
            author: 'me',
            version: '1.0.1',
            prepackageDeps: false,
            runtimeVersion: "2.1.3",
            softDependencies: '',
            hardDependencies: '',
        });
    });
    it('GIVEN profile is set to empty IT SHOULD not ask for it', async () => {
        const result = await (0, cli_1.cli)(['node', 'index',
            '-rt', 'npm',
            '-rv', '2.1.3',
            '-d', 'data',
            '-n', 'test.aws',
            '-a', 'me',
            '-v', '1.0.1',
            '--no-prepackageDeps',
            '--softDependencies', '',
            '--hardDependencies', '',
        ], {});
        expect(result).toStrictEqual({
            runtime: 'npm',
            dataFolder: 'data',
            name: 'test.aws',
            author: 'me',
            version: '1.0.1',
            runtimeVersion: "2.1.3",
            prepackageDeps: false,
            softDependencies: '',
            hardDependencies: '',
        });
    });
    it('GIVEN that there is already a version AUTO SHOULD return a patch level increased version', async () => {
        const result = await (0, cli_1.cli)(['node', 'index',
            '-rt', 'container',
            '-rv', '2.1.3',
            '-d', 'data',
            '-n', 'test.aws',
            '-a', 'me',
            '-v', 'AUTO',
            '--no-prepackageDeps',
            '--softDependencies', '',
            '--hardDependencies', '',
        ]);
        expect(result).toStrictEqual({
            runtime: 'container',
            dataFolder: 'data',
            name: 'test.aws',
            author: 'me',
            version: 'AUTO',
            runtimeVersion: "2.1.3",
            prepackageDeps: false,
            softDependencies: '',
            hardDependencies: '',
        });
    });
});
//# sourceMappingURL=cli.test.js.map