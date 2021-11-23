"use strict";
// Copyright 2021 Amazon.com.
// SPDX-License-Identifier: MIT
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
const awsclients_1 = require("./awsclients");
const fs = __importStar(require("fs"));
jest.setTimeout(15000);
describe('aws client tests', () => {
    it('returns an aws iot client', () => {
        const config = {
            profile: 'default',
            region: 'eu-west-1'
        };
        const client = awsclients_1.getIotClient(config);
        expect(client).toBeDefined();
    });
    it('returns an aws s3 client', () => {
        const config = {
            profile: 'default',
            region: 'eu-west-1'
        };
        const client = awsclients_1.getS3Client(config);
        expect(client).toBeDefined();
    });
    it('returns an aws greengrass client', () => {
        const config = {
            profile: 'default',
            region: 'eu-west-1'
        };
        const client = awsclients_1.getGreengrassV2Client(config);
        expect(client).toBeDefined();
    });
    it('return a list of regions', async () => {
        const config = {
            profile: 'iot'
        };
        const regions = await awsclients_1.fetchSupportedRegions(config);
        expect(regions.length).toBeGreaterThan(1);
    });
    it('return a list of profiles where there are profiles on the machine', async () => {
        if (fs.existsSync('~/.aws/config')) {
            const profiles = await awsclients_1.fetchProfiles();
            expect(profiles.length).toBeGreaterThan(1);
        }
    });
});
//# sourceMappingURL=awsclient.test.js.map