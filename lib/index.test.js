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
const index_1 = require("./index");
const main_1 = require("./main");
const fs = __importStar(require("fs"));
const config_1 = require("./config");
//jest.mock('./config');
jest.mock('./main');
describe('index test', () => {
    beforeAll(() => {
        try {
            fs.rmSync(config_1.getConfigFilePath());
        }
        catch (_a) { }
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
        await index_1.main(args);
        expect(fs.statSync(config_1.getConfigFilePath())).toBeTruthy();
        expect(JSON.parse(fs.readFileSync(config_1.getConfigFilePath()).toString('utf8'))).toStrictEqual({
            "author": "me",
            "runtime": "container",
            "runtimeVersion": "2.1.3",
            "dataFolder": "data",
            "hardDependencies": "",
            "name": "test.aws",
            "prepackageDeps": false,
            "softDependencies": "",
            "version": "1.0.1",
        });
        expect(main_1.executeTasks).toHaveBeenCalledWith({
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
});
//# sourceMappingURL=index.test.js.map