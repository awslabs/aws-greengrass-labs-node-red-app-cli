"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSupportedRegions = exports.getGreengrassV2Client = exports.getS3Client = exports.fetchProfiles = exports.getIotClient = void 0;
const client_iot_1 = require("@aws-sdk/client-iot");
const credential_provider_ini_1 = require("@aws-sdk/credential-provider-ini");
const client_s3_1 = require("@aws-sdk/client-s3");
const client_greengrassv2_1 = require("@aws-sdk/client-greengrassv2");
const client_ec2_1 = require("@aws-sdk/client-ec2");
let iot;
/**
 * Get an AWS IoT Client based on the region and profile defined in the config object
 * The client is cached for the lifetime to this script
 * If profile is not defined, uses the standard credential chain
 * @param config
 * @returns IoT client
 */
function getIotClient(config) {
    if (iot) {
        return iot;
    }
    if (config.profile) {
        const credentials = credential_provider_ini_1.fromIni({ profile: config.profile });
        iot = new client_iot_1.IoT({ region: config.region, credentials: credentials });
    }
    else {
        iot = new client_iot_1.IoT({ region: config.region });
    }
    return iot;
}
exports.getIotClient = getIotClient;
/**
 * Fetches the list of profiles from the standard profile folder ($HOME/.aws/credentials and $HOME/.aws/profiles)
 * @return A promise resolving to the list of profiles
 */
async function fetchProfiles() {
    try {
        let profiles = await credential_provider_ini_1.parseKnownFiles({});
        return Object.keys(profiles);
    }
    catch (err) {
        throw err;
    }
}
exports.fetchProfiles = fetchProfiles;
let s3;
/**
 * Get an AWS S3 Client based on the region and profile defined in the config object
 * The client is cached for the lifetime to this script
 * If profile is not defined, uses the standard credential chain
 * @param config
 * @returns S3 client
 */
function getS3Client(config) {
    if (s3) {
        return s3;
    }
    if (config.profile != 'default' && process.env['AWS_PROFILE'] === undefined) {
        const credentials = credential_provider_ini_1.fromIni({ profile: config.profile });
        s3 = new client_s3_1.S3({ region: config.region, credentials: credentials });
    }
    else {
        s3 = new client_s3_1.S3({ region: config.region });
    }
    return s3;
}
exports.getS3Client = getS3Client;
let gg;
/**
 * Get an AWS GreengrassV2 Client based on the region and profile defined in the config object
 * The client is cached for the lifetime to this script
 * If profile is not defined, uses the standard credential chain
 * @param config
 * @returns GreengrassV2 client
 */
function getGreengrassV2Client(config) {
    if (gg) {
        return gg;
    }
    if (config.profile) {
        const credentials = credential_provider_ini_1.fromIni({ profile: config.profile });
        gg = new client_greengrassv2_1.GreengrassV2({ region: config.region, credentials: credentials });
    }
    else {
        gg = new client_greengrassv2_1.GreengrassV2({ region: config.region });
    }
    return gg;
}
exports.getGreengrassV2Client = getGreengrassV2Client;
let supportedRegions;
function fetchSupportedRegions(config) {
    return new Promise((res, rej) => {
        if (supportedRegions) {
            res(supportedRegions);
            return;
        }
        const ec2 = new client_ec2_1.EC2({});
        const command = new client_ec2_1.DescribeRegionsCommand({});
        ec2.send(command).then(regionResp => {
            var _a;
            const regions = (_a = regionResp.Regions) === null || _a === void 0 ? void 0 : _a.map(x => x.RegionName);
            let supportedRegions = regions === null || regions === void 0 ? void 0 : regions.map(async (x) => {
                var gg;
                if (config.profile) {
                    const credentials = credential_provider_ini_1.fromIni({ profile: config.profile });
                    gg = new client_greengrassv2_1.GreengrassV2({ region: x, credentials: credentials });
                }
                else {
                    gg = new client_greengrassv2_1.GreengrassV2({ region: x });
                }
                try {
                    await gg.listComponents({});
                    return x;
                }
                catch (err) {
                    return undefined;
                }
            });
            Promise.all(supportedRegions).then(x => {
                const filtered = x.filter(y => y);
                res(filtered);
            });
        }).catch(err => { rej(err); return; });
    });
}
exports.fetchSupportedRegions = fetchSupportedRegions;
//# sourceMappingURL=awsclients.js.map