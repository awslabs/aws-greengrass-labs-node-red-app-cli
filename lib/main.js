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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeTasks = void 0;
const fs = __importStar(require("fs"));
const listr2_1 = require("listr2");
const types_1 = require("./types");
const yaml_1 = __importDefault(require("yaml"));
const fspath = __importStar(require("path"));
const utils_1 = require("./utils");
const RECIPES_PATH = 'recipes';
const ARTIFACTS_PATH = 'artifacts';
const NODES_ARCHIVE_NAME = 'nodes';
const FLOWS_ARCHIVE_NAME = 'flows.zip';
// Script to upload the flows and the modules to Node-RED
// Upload modules first then flows.
// If the modules are not from npm, but from github or local host, they must be packaged as a component first
let updateScript = `http = require('http');
fs = require('fs');
path = require('path');

async function post(data) {
    return new Promise((res, rej) => {
        req = http.request({port:1880, path: '/flows',  headers:  {'content-type':'application/json'}, method: 'POST'}, (r)=>{ res(r); });
        req.on('error', (e)=>{rej(e)})
        req.write(data);
        req.end();
    })
}
flow = fs.readFileSync(path.join('{artifacts:decompressedPath}','flows', 'flows.json'))
data = JSON.stringify(JSON.parse(flow));
(async () => { 
    console.log('Updating flows.json');
    await post(data);
    console.log('Done.');
})();
`;
let componentScript = `http = require('http');
fs = require('fs');
path = require('path');
const packages = JSON.parse(fs.readFileSync(path.join('{artifacts:path}','package.json'))).dependencies;

async function post(data) {
    return new Promise((res, rej) => {
        req = http.request({port:1880, path: '/nodes',  headers:  {'content-type':'application/json'}, method: 'POST'}, (r)=>{res(r.statusCode)});
        req.write(JSON.stringify({module: data}));
        req.on('error', (e)=>{rej(e)})
        req.end();
    })
}

async function delay(ms) {
    return new Promise(res=>setTimeout(res, ms));
}

async function update_nodes(packages) {
    for (x of Object.keys(packages)) {
        // Ignoring errors when trying to load new packages
        success = false
        cnt = 0
        while (!success && cnt < 10) {
            try {
                console.log('Adding package '+x);
                await post(x)
                success = true
            } catch (err) {
                console.warn('Node-RED server not yet up. Retrying in 1 sec...');
                await delay(1000);
                cnt += 1;
            }
        }
    }
}

(async () => {
    await update_nodes(packages);
})();`;
let componentScriptLocal = `http = require('http');
fs = require('fs');
path = require('path');

const packages = JSON.parse(fs.readFileSync(path.join('{artifacts:decompressedPath}', 'nodes', 'package.json'))).dependencies;

async function post(data) {
    return new Promise((res, rej) => {
        req = http.request({port:1880, path: '/nodes',  headers:  {'content-type':'application/json'}, method: 'POST'}, (r)=>{res(r.statusCode)});
        req.write(JSON.stringify({module: data}));
        req.on('error', (e)=>{rej(e)})
        req.end();
    })
}

async function delay(ms) {
    return new Promise(res=>setTimeout(res, ms));
}

async function update_nodes(packages) {
    for (x of Object.keys(packages)) {
        // Ignoring errors when trying to load new packages
        success = false
        cnt = 0
        while (!success && cnt < 10) {
            try {
                console.log('Adding package '+x);
                await post(path.join('{work:path}', 'node_modules', x))
                success = true
            } catch (err) {
                console.warn('Node-RED server not yet up. Retrying in 1 sec...');
                await delay(1000);
                cnt += 1;
            }
        }
    }
}

(async () => {
    await update_nodes(packages);
})();`;
async function executeTasks(config, testing = false) {
    var _a;
    const tasks = new listr2_1.Listr([
        {
            title: 'Create recipe',
            task: () => { return createRecipes(config); }
        },
        {
            title: 'Create nodes artifact',
            task: async (ctx) => {
                const artifactPath = fspath.join(ARTIFACTS_PATH, `${config.name}.nodes`);
                fs.mkdirSync(artifactPath, { recursive: true });
                const nodeArchiveTempPath = await utils_1.createNodeModulesArchive(config.dataFolder);
                ctx.nodeArchivePath = fspath.join(artifactPath, NODES_ARCHIVE_NAME + '.zip');
                fs.renameSync(nodeArchiveTempPath, ctx.nodeArchivePath);
            },
            skip: !((_a = config.prepackageDeps) !== null && _a !== void 0 ? _a : false)
        },
        {
            title: 'Copy package.json',
            task: async () => {
                const artifactPath = fspath.join(ARTIFACTS_PATH, `${config.name}.nodes`);
                fs.mkdirSync(artifactPath, { recursive: true });
                const packagePath = fspath.join(artifactPath, 'package.json');
                fs.copyFileSync(fspath.join(config.dataFolder, 'package.json'), packagePath);
            },
            skip: config.prepackageDeps
        },
        {
            title: 'Create flows archive',
            task: async () => {
                const artifactPath = fspath.join(ARTIFACTS_PATH, `${config.name}.flows`);
                fs.mkdirSync(artifactPath, { recursive: true });
                const flowsTempPath = await utils_1.createFlowsArchive(config.dataFolder);
                const flowsArchivePath = fspath.join(artifactPath, FLOWS_ARCHIVE_NAME);
                fs.renameSync(flowsTempPath, flowsArchivePath);
            }
        }
    ], { renderer: (testing ? 'verbose' : 'default') });
    await tasks.run({});
}
exports.executeTasks = executeTasks;
function createRecipes(config) {
    let version = config.version;
    // Flows component recipe
    let flowsRecipe = {
        RecipeFormatVersion: '2020-01-25',
        ComponentName: `${config.name}.flows`,
        ComponentVersion: version,
        ComponentDescription: "A node red flow",
        ComponentPublisher: config.author,
        ComponentDependencies: new Map(),
        Manifests: [{
                Platform: {
                    os: "linux"
                },
                Lifecycle: {
                    Startup: `cat <<EOF >script.js 
${updateScript}
EOF
node script.js`
                },
                Artifacts: [
                    {
                        Uri: `s3://_BUCKET_/${config.name}.flows/flows.zip`,
                        Unarchive: 'ZIP'
                    },
                ]
            }]
    };
    // Add component dependencies
    const runtime = config.runtime === types_1.Runtime.CONTAINER ? 'community.greengrass.nodered.docker' : 'community.greengrass.nodered';
    flowsRecipe.ComponentDependencies.set(`${config.name}.nodes`, { VersionRequirement: (version === 'AUTO' ? ">0.0.0" : version) });
    flowsRecipe.ComponentDependencies.set(runtime, { VersionRequirement: config.runtimeVersion });
    if (config.softDependencies && config.softDependencies.length > 0) {
        config.softDependencies.split(',').forEach((d) => {
            const dep = d.split('@');
            if (dep.length === 2 && dep[0].length > 0 && dep[1].length > 0) {
                flowsRecipe.ComponentDependencies.set(dep[0], { VersionRequirement: dep[1], DependencyType: 'SOFT' });
            }
            else {
                throw new Error(`Invalid soft dependency: ${d} in ${config.softDependencies}. Should be in the format component_name@semver`);
            }
        });
    }
    if (config.hardDependencies && config.hardDependencies.length > 0) {
        config.hardDependencies.split(',').forEach((d) => {
            const dep = d.split('@');
            if (dep.length === 2) {
                flowsRecipe.ComponentDependencies.set(dep[0], { VersionRequirement: dep[1], DependencyType: 'HARD' });
            }
            else {
                throw new Error(`Invalid hard dependency: ${d} in ${config.hardDependencies} `);
            }
        });
    }
    // Nodes component recipe
    let nodesRecipe = {
        RecipeFormatVersion: '2020-01-25',
        ComponentName: `${config.name}.nodes`,
        ComponentVersion: version,
        ComponentDescription: "Node-RED nodes",
        ComponentPublisher: config.author,
        ComponentDependencies: new Map(),
        Manifests: [{
                Lifecycle: {
                    Install: `rm -rf node_modules
cp -r {artifacts:decompressedPath}/nodes/node_modules .
chmod +rw -R node_modules`,
                    Startup: `node <<EOF 
${config.prepackageDeps ? componentScriptLocal : componentScript} 
EOF`,
                },
                Artifacts: [
                    {
                        Uri: `s3://_BUCKET_/${config.name}.nodes/${NODES_ARCHIVE_NAME}.zip`,
                        Unarchive: 'ZIP'
                    }
                ]
            }]
    };
    nodesRecipe.ComponentDependencies.set(runtime, { VersionRequirement: config.runtimeVersion });
    if (!config.prepackageDeps) {
        nodesRecipe.Manifests[0].Lifecycle.Install = '';
        nodesRecipe.Manifests[0].Artifacts[0].Uri = `s3://_BUCKET_/${config.name}.nodes/package.json`;
        nodesRecipe.Manifests[0].Artifacts[0].Unarchive = 'NONE';
    }
    try {
        fs.mkdirSync(RECIPES_PATH, { recursive: true });
        fs.writeFileSync(fspath.join(RECIPES_PATH, `${config.name}.flows-recipe.yaml`), Buffer.from(yaml_1.default.stringify(flowsRecipe)));
        fs.writeFileSync(fspath.join(RECIPES_PATH, `${config.name}.nodes-recipe.yaml`), Buffer.from(yaml_1.default.stringify(nodesRecipe)));
    }
    catch (err) {
        throw new Error('Unable to create recipes');
    }
}
//# sourceMappingURL=main.js.map