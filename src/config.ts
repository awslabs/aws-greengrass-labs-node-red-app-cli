// Copyright 2021 Amazon.com.
// SPDX-License-Identifier: MIT

import * as fs from 'fs';
import * as path from 'path';

const SAVED_CONFIG_PATH = '.gg-nodered'
const CONFIG_FILE_NAME = 'latest-config.json';

export function getConfigFilePath() {
    return path.join(SAVED_CONFIG_PATH, CONFIG_FILE_NAME);
}
export function getConfig() {
    let config = {};
    try {
        fs.statSync(getConfigFilePath());
        const conf = fs.readFileSync(getConfigFilePath());
        config = JSON.parse(conf.toString('utf8'));
    } catch {}
    finally {
        return config;
    }
}

export function saveConfig(config: any) {
    try {
        const stats = fs.statSync(SAVED_CONFIG_PATH);
        if (!stats.isDirectory()) {
            console.error(`Cannot write to ${SAVED_CONFIG_PATH}`);
            process.exit(1);
        }
    } catch (err) {
        fs.mkdirSync(SAVED_CONFIG_PATH);
    }
    try {
        fs.writeFileSync(getConfigFilePath(), JSON.stringify(config));
    } catch {
        console.error(`Error when writing config to ${getConfigFilePath()}`);
    }
}