import { IoT } from '@aws-sdk/client-iot';
import { S3 } from '@aws-sdk/client-s3';
import { Options } from './types';
import { GreengrassV2 } from '@aws-sdk/client-greengrassv2';
/**
 * Get an AWS IoT Client based on the region and profile defined in the config object
 * The client is cached for the lifetime to this script
 * If profile is not defined, uses the standard credential chain
 * @param config
 * @returns IoT client
 */
export declare function getIotClient(config: Options): IoT;
/**
 * Fetches the list of profiles from the standard profile folder ($HOME/.aws/credentials and $HOME/.aws/profiles)
 * @return A promise resolving to the list of profiles
 */
export declare function fetchProfiles(): Promise<string[]>;
/**
 * Get an AWS S3 Client based on the region and profile defined in the config object
 * The client is cached for the lifetime to this script
 * If profile is not defined, uses the standard credential chain
 * @param config
 * @returns S3 client
 */
export declare function getS3Client(config: Options): S3;
/**
 * Get an AWS GreengrassV2 Client based on the region and profile defined in the config object
 * The client is cached for the lifetime to this script
 * If profile is not defined, uses the standard credential chain
 * @param config
 * @returns GreengrassV2 client
 */
export declare function getGreengrassV2Client(config: Options): GreengrassV2;
export declare function fetchSupportedRegions(config: Options): Promise<(string | undefined)[]>;
