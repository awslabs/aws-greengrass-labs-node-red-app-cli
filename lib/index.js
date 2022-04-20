#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = void 0;
const cli_1 = require("./cli");
const main_1 = require("./main");
const config_1 = require("./config");
async function main(args) {
    let config = (0, config_1.getConfig)();
    let answers = await (0, cli_1.cli)(args, config);
    const answersCopy = { ...answers };
    (0, config_1.saveConfig)(answersCopy);
    await (0, main_1.executeTasks)(answers);
}
exports.main = main;
if (require.main === module) {
    (async () => {
        try {
            await main(process.argv);
        }
        catch (err) {
            console.error(err.message);
        }
    })();
}
//# sourceMappingURL=index.js.map