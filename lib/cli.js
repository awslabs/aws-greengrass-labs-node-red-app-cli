"use strict";
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
exports.cli = void 0;
const commander_1 = require("commander");
const inquirer = __importStar(require("inquirer"));
const types_1 = require("./types");
const installChoices = [types_1.Runtime.CONTAINER, types_1.Runtime.NPM];
const versionRegExp = /(\d+.\d+.\d+|AUTO)/;
async function promptForMissingOptions(options) {
    var _a;
    let questions = [
        {
            type: 'list',
            name: 'runtime',
            message: 'Please choose which type of install to use',
            choices: installChoices,
            default: options.runtime || installChoices[0],
        },
        {
            type: 'input',
            name: 'runtimeVersion',
            message: 'Which version of node-red runtime do you want to use?',
            validate(input) {
                if (input === 'latest') {
                    return true;
                }
                return (input.match(versionRegExp) !== null ? true : 'Version should be in format x.y.z');
            },
            default: options.runtimeVersion || 'latest'
        },
        {
            type: 'input',
            name: 'dataFolder',
            message: 'Where is the data folder located?',
            default: options.dataFolder || './data',
        },
        {
            type: 'input',
            name: 'name',
            message: 'What is the name of the component?',
            validate(input) {
                return input && input.length >= 3 ? true : 'Component name cannot be empty';
            },
            default: options.name
        },
        {
            type: 'input',
            name: 'version',
            message: 'What is the version of the component (AUTO or x.y.z)?',
            validate(input) {
                return (input.match(versionRegExp) !== null ? true : 'Version should be in format x.y.z');
            },
            default: options.version || '1.0.0'
        },
        {
            type: 'input',
            name: 'author',
            message: 'Who is the author of the component?',
            default: options.author
        },
        {
            type: 'confirm',
            name: 'prepackageDeps',
            message: 'Should node modules dependencies be prepackaged?',
            default: options.prepackageDeps || false,
        },
        {
            type: 'input',
            name: 'softDependencies',
            message: 'Comma separated list of additional SOFT dependencies',
            default: options.softDependencies || '',
        },
        {
            type: 'input',
            name: 'hardDependencies',
            message: 'Comma separated list of additional HARD dependencies',
            default: options.hardDependencies || ''
        }
    ];
    const answers = await inquirer.prompt(questions, (((_a = options.reset) !== null && _a !== void 0 ? _a : false) ? {} : options));
    return answers;
}
function verifyVersion(current, previous) {
    previous = previous;
    if (current.match(versionRegExp) !== null) {
        return current;
    }
    else {
        throw new commander_1.InvalidOptionArgumentError('invalid version. should conform to x.y.z');
    }
}
function verifyName(current, previous) {
    previous = previous;
    if (current.length >= 3) {
        return current;
    }
    else {
        throw new commander_1.InvalidOptionArgumentError('invalid name. should be at least 3 characters long');
    }
}
/**
 * Parses the args and prompts the user for missing information. There are no defaults for the command line
 * parameters: if any parameter value is missing it will be asked iteratively to the user.
 * The function accepts a config object containing previously stored parameters which will not be asked to the user.
 * @param args the array of command line arguments to process
 * @param config the previously provided options
 * @returns a Promise<Options> that resolves as the config is completed
 */
async function cli(args, config) {
    const createCommand = new commander_1.Command('create');
    createCommand
        .option('--reset', 'resets the previously cached values')
        .option('-rv, --runtimeVersion <version>', 'version of Node-RED to download from npm')
        .option('-d, --dataFolder <folder>', 'the data folder for Node-RED')
        .option('-n, --name <name>', 'component name', verifyName)
        .option('-a, --author <name>', 'the name of the author of the component')
        .option('-v, --version <version>', 'component version', verifyVersion)
        .option('--prepackageDeps', 'pre-package dependencies')
        .option('--no-prepackageDeps', 'pre-package dependencies')
        .option('--softDependencies <deps>', 'list of soft dependencies')
        .option('--hardDependencies <deps>', 'list of hard dependencies');
    createCommand.addOption(new commander_1.Option('-rt, --runtime <type>', 'how do you want to install Node-RED').choices(installChoices));
    const program = createCommand;
    createCommand.version('1.0.0');
    program.parse(args);
    if (!config) {
        config = {};
    }
    let options;
    options = { ...config, ...program.opts() };
    options = (await promptForMissingOptions(options));
    return options;
}
exports.cli = cli;
//# sourceMappingURL=cli.js.map