// Copyright 2021 Amazon.com.
// SPDX-License-Identifier: MIT

import { main } from './index';

import { executeTasks } from './main';
import * as fs from 'fs';
import { getConfigFilePath } from './config';

//jest.mock('./config');
jest.mock('./main');

describe('index test', () => {
    beforeAll(() => {
        try {
            fs.rmSync(getConfigFilePath());
        } catch {}
    });

    it('calling main with args saves the config and executes the tasks', async () => {
        const args = ['node', 'index',
            '-rt', 'container',
            '-rv', '2.1.3',
            '-d', 'data',
            '-n', 'test.aws',
            '-a', 'me',
            '-v', '1.0.1',
            '--no-prepackageDeps',
            '--softDependencies', '',
            '--hardDependencies', '',
        ];
        await main(args);
        expect(fs.statSync(getConfigFilePath())).toBeTruthy();
        expect(JSON.parse(fs.readFileSync(getConfigFilePath()).toString('utf8'))).toStrictEqual(
            {
                    "author": "me",
                    "runtime": "container",
                    "runtimeVersion": "2.1.3",
                    "dataFolder": "data",
                    "hardDependencies": "",
                    "name": "test.aws",
                    "prepackageDeps": false,
                    "softDependencies": "",
                    "version": "1.0.1",
                }
        )
        expect(executeTasks).toHaveBeenCalledWith({
            "author": "me",
            "dataFolder": "data",
            "hardDependencies": "",
            "name": "test.aws",
            "prepackageDeps": false,
            "runtime": "container",
            "softDependencies": "",
            "version": "1.0.1",
            "runtimeVersion": "2.1.3",
        });
    });

})