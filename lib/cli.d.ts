import { Options } from './types';
/**
 * Parses the args and prompts the user for missing information. There are no defaults for the command line
 * parameters: if any parameter value is missing it will be asked iteratively to the user.
 * The function accepts a config object containing previously stored parameters which will not be asked to the user.
 * @param args the array of command line arguments to process
 * @param config the previously provided options
 * @returns a Promise<Options> that resolves as the config is completed
 */
export declare function cli(args: string[], config?: Options): Promise<Options>;
