const files = require('./files');
const chalk = require('chalk');
const lib = require('./lib');
const inquirer = require('inquirer');

const printSites = (label, sites) => {
    console.log(chalk.yellow(label));

    if (sites.length === 0) {
        console.log('- No sites -');
        return;
    }

    for (site of sites) {
        const active = !site.endsWith('.disabled');

        const domain = active
            ? site.replace('.conf', '')
            : site.replace('.conf.disabled', '');

        console.log(active
            ? chalk.greenBright(domain)
            : chalk.gray(domain)
        );
    }
}

const getSitesPath = () => {
    return files.getCurrentDirectory() + '\\reverse-proxy\\sites';
}

const showStatus = async () => {
    const sitesPath = getSitesPath();

    const enabledSites = files.getFilesWithPattern(sitesPath, '.*\.conf$');
    printSites('Enabled sites:', enabledSites);

    lib.newline();

    const disabledSites = files.getFilesWithPattern(sitesPath, '.*\.conf\.disabled$');
    printSites('Disabled sites:', disabledSites);
};

const createHost = async () => {
    const host = (await inquirer.prompt({
        name: 'host',
        type: 'input',
        message: 'Host:',
        default: 'localhost',
        validate: function( value ) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter host name';
            }
        }
    })).host;

    const port = (await inquirer.prompt({
        name: 'port',
        type: 'input',
        default: '9000',
        message: 'Port:',
        validate: function( value ) {
            if (value.length) {
                return true;
            } else {
                return 'Please enter port number';
            }
        }
    })).port;

    let config = files.readFile(files.getCurrentDirectory() + '\\reverse-proxy\\host-template.conf');

    config = config.replace(/%HOST%/g, host);
    config = config.replace(/%PORT%/g, port);

    const confFile = host + '.conf';
    files.writeFile(getSitesPath() + '\\' + confFile, config);
};

const deleteHost = async () => {
    // TODO
    console.log('deleteHost');
};

const deleteAllHosts = async () => {
    // TODO
    console.log('deleteAllHosts');
};

const changePort = async () => {
    // TODO
    console.log('changePort');
};

const disableHost = async () => {
    // TODO
    console.log('disableHost');
};

const enableHost = async () => {
    // TODO
    console.log('enableHost');
};

const startProxy = async () => {
    // TODO
    console.log('startProxy');
};

const stopProxy = async () => {
    // TODO
    console.log('stopProxy');
};

const restartProxy = async () => {
    // TODO
    console.log('restartProxy');
};

const reloadNginx = async () => {
    // TODO
    console.log('reloadNginx');
};

module.exports = {
    showStatus: showStatus,
    createHost: createHost,
    deleteHost: deleteHost,
    deleteAllHosts: deleteAllHosts,
    changePort: changePort,
    disableHost: disableHost,
    enableHost: enableHost,
    startProxy: startProxy,
    stopProxy: stopProxy,
    restartProxy: restartProxy,
    reloadNginx: reloadNginx,
};