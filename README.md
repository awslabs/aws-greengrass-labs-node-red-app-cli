# AWS IoT Greengrass v2 Node-RED CLI

A CLI tool that create Greengrass v2 components from your Node-RED flows.

Node-RED is a great low-code solution, based on NodeJS, and it can run on a disparate range of devices. Deploying Node-RED on a few server or a laptop is trivial, deploying and managing the software on hundreds or thousands devices is a challenging process and there are no out-of-the-box solutions. 

The [Node-RED community components]() can be used to deploy Node-RED to thousands of devices running AWS IoT Greengrass and provide a tested and secured solution, but this only solves one aspect of the problem.

The other aspect is about the management of the Node-RED flows to be run on those thousands of devices, which is what the Node-RED CLI tools is solving.

This tool allows users to take a Node-RED flow that has been created in a local Node-RED environment and distribute it to all the target devices thanks to the AWS IoT Greengrass deployment mechanism. 

The tool can be used both interactively or integrated as part of a CI/CD pipeline. 

## Pre-requisites

### Development machine
* NodeJS v14 or above (should work with other NodeJS version but has not been tested)
* (Optional) npx

### Devices
* AWS IoT Greengrass and its prerequisites [Install the AWS IoT Greengrass Core software](https://docs.aws.amazon.com/greengrass/v2/developerguide/install-greengrass-core-v2.html)
* NodeJS compatible with the Node-RED version (eg Node 12 for Node-RED 2.x) installed on the host [NodeJS downloads](https://nodejs.org/en/download/). `nvm` and similar tools are not supported.
* If you run Node-RED as a container, install the Docker engine [Install Docker engine](https://docs.docker.com/engine/install/)
* A deployment containing one of the Node-RED Greengrass components https://github.com/awslabs/aws-greengrass-labs-nodered or https://github.com/awslabs/aws-greengrass-labs-nodered-docker and their dependencies https://github.com/awslabs/aws-greengrass-labs-nodered-auth and https://github.com/awslabs/aws-greengrass-labs-secretsmanagerclient 

## Installation

You can run this tool via `npx` or by cloning the repo locally.

### npx

To install `npx`:

```bash
npm install -g npx
```

### 

To clone the repo:

```bash
git clone https://github.com/awslabs/aws-greengrass-labs-node-red-app-cli.git
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

> **Advanced tip**: the default Node-RED image is based on Alpine Linux. Most of the nodes work with Alpine but some libraries requiring C bindings might depend on glibc which is not included in Alpine. If you still prefer using containers, you can build your own image based on Ubuntu (for example) [Build your own docker image](https://github.com/node-red/node-red-docker/tree/master/docker-custom)


Then open `http://localhost:1880` and develop your flow. Deploy the flow using the Node-RED UI and eventually test it locally.

### Running the tool

To run the tool, open a terminal console and type:

```bash
npx <repo> --help
```

or

```bash
<repo_path>/lib/index.js --help
```

You can provide the listed options as parameters on the command line, or you can leave them empty and you will be prompted to provide the necessary values.


Options:
* --reset                          resets the previously cached values
* -rv, --runtimeVersion <version>  version of Node-RED runtime component to use, x.y.z or AUTO for latest version
* -d, --dataFolder <folder>        the data folder for Node-RED
* -n, --name <name>                component name
* -a, --author <name>              the name of the author of the component
* -v, --version <version>          component version
* --prepackageDeps                 pre-package dependencies
* --no-prepackageDeps              pre-package dependencies
* --softDependencies <deps>        list of soft dependencies
* --hardDependencies <deps>        list of hard dependencies
* -rt, --runtime <type>            type of Node-RED runtime component (choices: "container", "npm")
* -V, --version                    output the version number
* -h, --help                       display help for command


## Components

Node-RED flows are saved in the `userDir` specified when running Node-RED. The `userDir` location on the local host must be specified with the `--data` option and can be absolute or relative to the folder where the tool is run.

In case you used the previous docker example the data folder would be located in  `$PWD/data`. In case you are running the command from then $PWD folder, you can omit the `--data` flag altogether since `./data` is used as default.

This data folder contains the flows, the encrypted credentials used by the flow, the Node-RED settings, the runtime configuration and all the additional NodeJS modules that have been installed via the Node-RED palette.

The tool creates two components from this configuration data:

* a flows component: contains the flows configuration 
* a nodes component: contains the additional NodeJS modules installed by 3rd party nodes used in the flow

The two components are named according to the `--name` provided, appending `.flows` and `.nodes` respectively.

The components version can be provided explicitly, or you can let the tool to determine the version by specifying the value `AUTO`.  When specifying a version other than `AUTO`, both components will get the same version. 

The flows component is dependent on the nodes component and on a runtime component (`container` or `npm`). You can specify a version for the runtime on which to depend on, or specify `AUTO` to select the latest version available. 

### Flows component

The flows component (postfixed with `.flow`) consists of the `flows.json` and `flows_cred.json`.

The credentials in `flows_cred.json` are encrypted using a randomly generated key (which is stored in `.config.runtime.json`). In order to allow the decoding of the credentials on the target devices, the tool copies the randomly generated key into `settings.js` unless there is a user defined key already specified.

### Nodes component

The nodes component can be built in 2 ways:

1. with only a `package.json` file specifying the dependencies
2. packaging the `node_modules` folder from the dev environment

When using option 1, the component, once deployed on the device, calls the Node-RED admin API to add the packages specified in the `package.json` file. The packages must be available through `npmjs.org`, and `npmjs.org` site must be reachable by the device. Node-RED takes care of downloading and installing the dependencies.

If you are deploying private packages, test packages, or the device does not have access to `npmjs.org` you should use option 2. It uses the Node-RED API but instead of asking Node-RED to get the packages from `npmjs.org` it passes the path to the local copies of the packages provided by the nodes component. 

Option 2 minimizes the downtime of the device when a deployment is performed, since the installation of the packages by Node-RED is run after the previous Node-RED application has been stopped and the downtime will be dependent on the network speed available from the device and the size of the npm modules to be downloaded.

## Cloud components

The tool only creates the local artifacts and recipes for the components that are needed to deploy the Node-RED flows to a AWS IoT Greengrass device running one of the AWS IoT Greengrass Node-RED runtime component.

To deploy the component to the devices you need to first publish them to the cloud and then deploy them to the devices.

The recommended way to do this is to use the AWS IoT Greengrass development kit.

To create component version and upload artifacts, the AWS IoT Greengrass development kit requires AWS IAM credentials available to the shell process where it is running. These can be provided using environment variables, profiles or EC2 profiles.

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

## Deployment

### Run As option

If using the container runtime on the target device, you need to specify the `uid` and `gid` that AWS IoT Greengrass uses to run the container. This is required to ensure that the container own user has access to the host files that get mounted via bind mounts. 

The default is `1000:1000` which is what the `nodered/node-red` container uses. If you are using your own container and use a different `uid/gid` you must configure the user and group accordingly.

Ensure that the user is also part of the `docker` group in order to be able to run the container.

This constraint does not apply to the `aws.greengrass.labs.nodered` component.

If any Node-RED node requires access to host resources, you must ensure that the host resources are accessible to the user running Node-RED by means of permissions. If you are using the docker version, you must also ensure that the resources are correctly mounted in the container. 

## Connecting to Node-RED on the device

For security reasons, the Node-RED console on the device is only accessible from localhost and even if your device is reachable via a public IP address you will not be able to access the Node-RED console.

In order to connect to the Node-RED console you can use port forwarding via `ssh`. This requires that the machine you are using to connect from has IP access to the device.

```bash
ssh -L 1880:localhost:1881 -i /your/ssh/key user@10.2.3.4
```

Then you can access the remote Node-RED from `http://localhost:1881`.

If your local machine does not have IP reachability to the device, you can use SSM Session Manager through the deployment of the [Session Manager agent component](https://docs.aws.amazon.com/greengrass/v2/developerguide/systems-manager-agent-component.html). 

Once the component has been deployed on the device, you can setup port forwarding as explained in the [Port Forwarding Using AWS System Manager Session Manager](https://aws.amazon.com/blogs/aws/new-port-forwarding-using-aws-system-manager-sessions-manager/) blog post.


## Updating the application

To update a running application just define a new flow, deploy it locally and re-run the tool. The tool caches the answers given on the first run and does not prompt you for any further information. 
Upload then the components and deploy them.

## Provide new values

To override any values already provided, specify the parameter new value on the command line, use `--reset` flag, or remove the content of the `.gg-nodered` folder which is located in the same folder where you run the tool.

We recommend using the `--reset` flag, as this option will prompt the user for all values but proposes the previous value as default.