// esm
const { dockerCommand } = require('docker-cli-js');

// default options
const options = {
    machineName: null, // uses local docker
    currentWorkingDirectory: null, // uses current working directory
    echo: false, // echo command output to stdout/stderr
};

const inspect = async (name) => {
    const response = await dockerCommand('inspect ' + name, options);

    return response.object;
};

module.exports = {
    inspect: inspect,
};