/**
 * The target
 */

export enum Runtime {
    CONTAINER = 'container',
    NPM = 'npm'
}

export interface Target {
    thing: string;
    thingGroup: string;
}

/**
 * The Options interface
 */
export interface Options {
    reset?: boolean;
    prepackageDeps?: boolean;
    version?: string;
    runtime?: Runtime;
    author?: string;
    runtimeVersion?: string;
    dataFolder?: string;
    name?: string;
    headless?: boolean;
    softDependencies?: string;
    hardDependencies?: string;
}