export declare function createNodeModulesArchive(dataFolder: string): Promise<string>;
export declare function createFlowsArchive(dataFolder: string): Promise<string>;
/**
 * Create a string representation of an object. Support object whose fields
 * are string, numbers, boolean and arrays
 *
 * @param o the object to be stringified
 * @returns a string representing the object
 */
export declare function stringifyObj(o: any): string;
