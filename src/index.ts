#!/usr/bin/env node

import { cli } from './cli';
import { executeTasks } from './main';
import { getConfig, saveConfig } from './config';

export async function main(args: string[]) {
    let config = getConfig();
    let answers = await cli(args, config);

    const answersCopy = { ...answers };

    saveConfig(answersCopy);
    await executeTasks(answers);
}

if (require.main === module) {
    (async () => {
        try {
            await main(process.argv);
        } catch (err: any) {
            console.error(err.message);
        }
    })();
}