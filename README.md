# AWS IoT Greengrass v2 Node-RED CLI

A CLI tool that create Greengrass v2 components from your Node-RED flows

## Pre-requisites

### Development machine
* NodeJS v14 or above (should work with other NodeJS version but has not been tested)
* (Optional) npx

### Devices
* AWS IoT Greengrass and its prerequisites [Install the AWS IoT Greengrass Core software](https://docs.aws.amazon.com/greengrass/v2/developerguide/install-greengrass-core-v2.html)
* NodeJS compatible with the Node-RED version (eg Node 12 for Node-RED 2.x) installed on the host [NodeJS downloads](https://nodejs.org/en/download/). `nvm` and similar tools are not supported.
* If you run Node-RED as a container, install the Docker engine [Install Docker engine](https://docs.docker.com/engine/install/)

## Installation

You can run this tool via `npx` or clone the repo and run locally.

### npx

To install `npx`:

```bash
npm install -g npx
```

## Usage

Node-RED applications can be created and deployed in 4 simple steps:

1. Launch Node-RED on your development machine (laptop, VM, cloud instance) either via docker or from the host
1. Design you application in Node-RED as one or multiple flows
1. Deploy the flows locally
1. Run the tool
 
For installing and running Node-RED and creating flows, please refer to [Node-RED documentation](https://nodered.org).

### Example: running Node-RED as a container on your development machine

To quickly get started you can use one of the provided examples (this assume you have installed Docker on your laptop):

```bash
cd examples/<example name>/data
npm install
cd ..
docker run -p 1880:1880 -v $PWD/data:/data nodered/node-red:latest
```

This will install some additional packages in the `data` folder in the current directory where Node-RED stores the flows and the additional modules you might install.

> **Advanced tip**: that the default Node-RED image is based on Alpine Linux. Most of the nodes work with Alpine but some libraries requiring C bindings might depend on glibc which is not included in Alpine. If you still prefer using containers, you can build your own image based on Ubuntu (for example) [Build your own docker image](https://github.com/node-red/node-red-docker/tree/master/docker-custom)


Then open `http://localhost:1880` and develop your flow. Deploy the flow and eventually test it locally.

### Running the tool

Run the tool from the same folder where you run the docker command ($PWD) specifying `./data` as the data folder (this is the default value).

```bash
npx <repo> --help
```

or

```bash
<repo_path>/lib/index.js --help
```

You can provide the listed options as parameters on the command line, or you can leave them empty and you will be prompted to provide the necessary values.


*  --reset                    resets the previously cached values
*  -d, --dataFolder <folder>  the data folder for Node-RED
*  -n, --name <name>          component name
*  -a, --author <name>        the name of the author of the component
*  -v, --version <version>    component version
*  --prepackageDeps           pre-package dependencies
*  --softDependencies <deps>  list of soft dependencies
*  --hardDependencies <deps>  list of hard dependencies
*  -rt, --runtime <type>      the runtime component to use (choices: "container", "npm")
*  -rv, --runtimeVersion <v>  the version of the runtime component
*  -h, --help                 display help for command

## Runtimes

You can use either the Node-RED container runtime (`community.greegrass.nodered.container`) or an npm runtime (`community.greengrass.nodered`).
The component used must have been published to your account Greengrass repo for the deployment to succeed.

When using the container runtime, you need to explicitly add the component to the deployment and specify the system user `1000` and group `1000` under the component deployment configuration options.


## Components

Node-RED flows are saved in the `userDir` specified when running Node-RED. The `userDir` location on the local host must be specified with the `--data` option and can be absolute or relative to the folder where the tool is run.

This data folder contains the flows, the encrypted credentials used by the flow, the Node-RED settings, the runtime configuration and all the additional node_modules that have been installed via the Node-RED palette.

The tool creates two components from this configuration data:

* a flows component
* a nodes component

The two components are named according to the `--name` provided, appending `.flows` and `.nodes` respectively.

When specifying a version other than `AUTO` The flows component is dependent on the same version of the nodes component and the versions of the two components are maintained in-sync. 

When using `AUTO`, the nodes components dependency is set to `">0.0.0"`, which is equivalent to get the latest version. The deployment tool (`ggcli`) will calculate the appropriate component version for the two components when uploading them. In this case the component versions might get out of sync. 

AWS IoT Greengrass does not allow to create a new component with an existing version: you need to first delete the existing version in order to create a new one with the same version value. We do not recommend to do this, since it can cause issues when deploying the same component and version but with different content to the device.

### Flows component

The flows component (postfixed with `.flow`) consists of the `flows.json` and `flows_cred.json`.

The credentials in `flows_cred.json` are encrytped using a randomly generated key (which is stored in `.config.runtime.json`). In order to allow the decoding of the credentials on the target devices, the tool copies the randomly generated key into `settings.js` unless there is a user defined key already specified.

### Nodes component

The nodes component can be built in 2 ways:

1. with only `package.json`
2. prepackaging the `node_modules` folder from the dev environment

In option one the component call the Node-RED admin API to add the new packages. The packages must be available through `npmjs.org`.

If you are deploying private packages, or test packages, you can use option 2, which also uses the Node-RED API but install the local copies of the packages. Another use of option 2 is to deploy the additional packages without depending on `npmjs.org`.
Option 2 minimize the downtime of the device when a deployment is performed, since the download of the packages by Node-RED when using option 1 is run after the previous Node-RED application has been stopped and the downtime will be dependent on the network speed available from the device and the size of the npm modules to be downloaded.

## Cloud components

The tool only creates the local artifacts and recipes for the components that are needed to deploy the Node-RED flows to a Greengrass via the selected Greengrass Node-RED runtime component.

To deploy the component to the devices you need to publish them to the cloud and deploy them to the devices.

The recommended way to do this is to use the Greengrass development kit.

To create component version and upload artifacts, the Greengrass development kit requires AWS IAM credentials available to the shell process where it is running. These can be provided using environment variables, profiles or EC2 profiles.

When running from your laptop we recommend using profiles.

The minimal permission that need to be associated to the credentials are as follow:

```json
{
   "Statements": [
        {
            "Effect": "allow",
            "Actions": [
                "greengrass:CreateComponentVersion",
                "greengrass:CreateDeployment",
                "greengrass:GetDeployment",
                "greengrass:ListDeployments",
                "iot:DescribeThing",
                "iot:ListThingGroups",
                "s3:ListBuckets"
            ],
            "Resources": ["*"]
        },
        {
            "Effect": "allow",
            "Actions": [
                "s3:PutObject"
            ],
            "Resources": ["arn:aws:s3:::bucket_name/prefix/*"]
        }
    ]
}
```

Replace `bucket_name/prefix` with your own bucket and prefix. This is used by the tool to upload the artifacts.

## Authentication

When running Node-RED locally, it is usual to not have any authentication to access the editor. When deploying to remote devices, this could expose the system to serious security risks. For this reason we recommend that you add a `username` and `passwordHash` configuration to the Node-RED runtime component. 

To do this, you add the selected component to the deployment, and provide a component configuration.

The password hash can be generated via the following script:

<TODO>

## Deployment


### Run As option

If using the container runtime on the target device, you need to specify the `uid` and `gid` that Greengrass should use to run the container. This is required to ensure that the container own user has access to the host files that get mounted via bind mounts. 

The default is `1000:1000` which is what the `nodered/node-red` container uses. If you are using your own container and use a different `uid/gid` you should configure this option accordingly.

Ensure that whichever user is specified, it is also part of the `docker` group in order to be able to run the container.

If you are running Node-RED from the host, it will run as the default component user specified for Greengrass (`ggc_user:ggc_group`).

If anu nodes require access to host resources, you should ensure that the host resources are accessible to the user running Node-RED by means of permissions. 

## Connecting to Node-RED on the device

For security reasons, the Node-RED UX on the device is only accessible from localhost. Even if your device is reachable via a public IP address you will not be able to access the UX.

For testing and development, you can do port forwarding via `ssh`.

```bash
ssh -L 1880:localhost:1881 -i /your/ssh/key user@10.2.3.4
```

Then you can access the remote Node-RED from `http://localhost:1881`.

If you need to have access to the UX also in production, you should deploy an http proxy such as Nginx or HAProxy, to expose the local port via the public IP address. You should secure the public access via TLS for which you can leverage the proxy.


## Updating the application

To update a running application just define a new flow and re-run the tool. The tool caches the answers given on the first run and does not prompt you for any further information. 


## Provide new values

To override any values already provided, specify the parameter new value on the command line, use `--reset` flag, or remove the content of the `.gg-nodered` folder which is located in the same folder where you run the tool.

We recommend using the `--reset` flag, as this option will prompt the user for all values but proposes the previous value as default.