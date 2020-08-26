const lib = require('./lib');

// esm
const { dockerCommand } = require('docker-cli-js');

// default options
const options = {
    machineName: null, // uses local docker
    currentWorkingDirectory: null, // uses current working directory
    echo: false, // echo command output to stdout/stderr
};

const execute = async (command) => {
    try {
        const response = await dockerCommand(command, options);

        return response.object;
    } catch (err) {
        // Do nothing
    }

    return null;
};

const inspectContainer = async (name) => {
    const response = await execute('container inspect ' + name);

    if (response === null) {
        return [];
    }

    return response;
};

const inspectImage = async (name) => {
    const response = await execute('image inspect ' + name);

    if (response === null) {
        return [];
    }

    return response;
};

const buildImage = async (name, path) => {
    const command = 'cd ' + path + ' && docker build -t ' + name + ' .';

    return lib.shellRun(command);
}

module.exports = {
    inspectContainer: inspectContainer,
    inspectImage: inspectImage,
    buildImage: buildImage
};