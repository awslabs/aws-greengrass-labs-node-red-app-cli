import { Command, InvalidOptionArgumentError, Option } from 'commander';
import * as inquirer from 'inquirer';
import { Options, Runtime } from './types'

const installChoices = [Runtime.CONTAINER, Runtime.NPM];

const versionRegExp = /(\d+.\d+.\d+|AUTO)/;


async function promptForMissingOptions(options: Options) {
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
            validate (input: any) {
                if (input === 'latest') {
                    return true;
                }
                return (input.match(versionRegExp) !== null ? true: 'Version should be in format x.y.z')
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
            validate (input: any) {
                return input && input.length >= 3 ? true : 'Component name cannot be empty'; 
            },
            default: options.name
        },
        {
            type: 'input',
            name: 'version',
            message: 'What is the version of the component (AUTO or x.y.z)?',
            validate (input: any) {
                return (input.match(versionRegExp) !== null ? true: 'Version should be in format x.y.z')
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
  
    const answers =  await inquirer.prompt(questions, ((options.reset ?? false) ? {} : options));
    return answers;
}


function verifyVersion(current: string, previous?: string): string {
    previous = previous;
    if (current.match(versionRegExp) !== null) {
        return current;
    } else {
        throw new InvalidOptionArgumentError('invalid version. should conform to x.y.z', );
    }
}

function verifyName(current: string, previous?: string): string {
    previous = previous;
    if (current.length >= 3) {
        return current;
    } else {
        throw new InvalidOptionArgumentError('invalid name. should be at least 3 characters long');
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
export async function cli(args: string[], config?: Options): Promise<Options> {
    const createCommand = new Command('create');

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
    .option('--hardDependencies <deps>', 'list of hard dependencies')
    createCommand.addOption(new Option('-rt, --runtime <type>', 'how do you want to install Node-RED').choices(installChoices))
    const program = createCommand;
    
    createCommand.version('1.0.0');

    program.parse(args);
    if (!config) {
        config = {}
    }
    let options: Options;
    options = { ...config , ...program.opts()};
    options = (await promptForMissingOptions(options)) as Options;
    return options;
}