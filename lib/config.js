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
exports.saveConfig = exports.getConfig = exports.getConfigFilePath = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const SAVED_CONFIG_PATH = '.gg-nodered';
const CONFIG_FILE_NAME = 'latest-config.json';
function getConfigFilePath() {
    return path.join(SAVED_CONFIG_PATH, CONFIG_FILE_NAME);
}
exports.getConfigFilePath = getConfigFilePath;
function getConfig() {
    let config = {};
    try {
        fs.statSync(getConfigFilePath());
        const conf = fs.readFileSync(getConfigFilePath());
        config = JSON.parse(conf.toString('utf8'));
    }
    catch (_a) { }
    finally {
        return config;
    }
}
exports.getConfig = getConfig;
function saveConfig(config) {
    try {
        const stats = fs.statSync(SAVED_CONFIG_PATH);
        if (!stats.isDirectory()) {
            console.error(`Cannot write to ${SAVED_CONFIG_PATH}`);
            process.exit(1);
        }
    }
    catch (err) {
        fs.mkdirSync(SAVED_CONFIG_PATH);
    }
    try {
        fs.writeFileSync(getConfigFilePath(), JSON.stringify(config));
    }
    catch (_a) {
        console.error(`Error when writing config to ${getConfigFilePath()}`);
    }
}
exports.saveConfig = saveConfig;
//# sourceMappingURL=config.js.map