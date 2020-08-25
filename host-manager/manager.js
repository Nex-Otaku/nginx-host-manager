const files = require('./files');
const chalk = require('chalk');
const lib = require('./lib');
const inquirer = require('inquirer');
const docker = require('./docker');

const printSites = (label, sites) => {
    console.log(chalk.yellow(label));

    if (sites.length === 0) {
        console.log('- No sites -');
        return;
    }

    for (const site of sites) {
        const active = !site.endsWith('.disabled');

        const domain = active
            ? site.replace('.conf', '')
            : site.replace('.conf.disabled', '');

        console.log(active
            ? chalk.greenBright(domain)
            : chalk.gray(domain)
        );
    }
};

const getSitesPath = () => {
    return files.getCurrentDirectory() + '\\reverse-proxy\\sites';
};

const isProxyOnline = async () => {
    const containerName = 'reverse-proxy';
    const infos = await docker.inspect(containerName);

    if (infos.length < 1) {
        return false;
    }

    let foundInfo = null;

    for (const info of infos) {
        if (info.Name === '/' + containerName) {
            foundInfo = info;
            break;
        }
    }

    if (foundInfo === null) {
        return false;
    }

    if (!foundInfo.State.Running) {
        return false;
    }

    const bindings = foundInfo.HostConfig.PortBindings;
    const port80 = '80/tcp';

    if (!(port80 in bindings)) {
        return false;
    }

    const binding = bindings[port80];

    if (!Array.isArray(binding)) {
        return false;
    }

    if (binding.length !== 1) {
        return false;
    }

    const first = binding[0];

    return (first.HostIp === '') && (first.HostPort === '80');
};

const showStatus = async () => {
    const proxyOnline = await isProxyOnline();
    console.log('Reverse Proxy: ' + (
        proxyOnline
            ? chalk.greenBright('Online')
            : chalk.red('Offline')
    ));

    lib.newline();

    const sitesPath = getSitesPath();
    const enabledSites = files.getFilesWithPattern(sitesPath, '.*\.conf$');
    printSites('Enabled sites:', enabledSites);

    lib.newline();

    const disabledSites = files.getFilesWithPattern(sitesPath, '.*\.conf\.disabled$');
    printSites('Disabled sites:', disabledSites);
};

const getHosts = () => {
    let hosts = [];
    const sitesPath = getSitesPath();

    const enabledSites = files.getFilesWithPattern(sitesPath, '.*\.conf$');

    for (const site of enabledSites) {
        hosts.push(site.replace('.conf', ''));
    }

    const disabledSites = files.getFilesWithPattern(sitesPath, '.*\.conf\.disabled$');

    for (const site of disabledSites) {
        hosts.push(site.replace('.conf.disabled', ''));
    }

    return hosts;
};

const selectHost = async (prompt, hosts) => {
    const hostsCopy = [].concat(hosts);
    hostsCopy.push(' -- cancel');

    const result = await inquirer.prompt([
        {
            type: 'list',
            name: 'host',
            message: prompt,
            choices: hostsCopy,
            pageSize: 30,
        }
    ]);

    if (result.host === ' -- cancel') {
        return '';
    }

    return result.host;
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

    files.writeFile(getEnabledConfigFile(host), config);
};

const getEnabledConfigFile = (host) => {
    return getSitesPath() + '\\' + host + '.conf';
};

const getDisabledConfigFile = (host) => {
    return getSitesPath() + '\\' + host + '.conf.disabled';
};

const getConfigFile = (host) => {
    if (files.fileExists(getEnabledConfigFile(host))) {
        return getEnabledConfigFile(host);
    }

    if (files.fileExists(getDisabledConfigFile(host))) {
        return getDisabledConfigFile(host);
    }

    return null;
};

const deleteHost = async () => {
    const hosts = getHosts();
    const host = await selectHost('Host to delete', hosts);

    if (host === '') {
        console.log('No deletion');
        return;
    }

    const configFile = getConfigFile(host);

    if (configFile === null) {
        return;
    }

    files.deleteFile(configFile);
    console.log('Configuration for host "' + host + '" was deleted');
};

const isConfirmed = async (prompt) => {
    const result = await inquirer.prompt({
            type: 'confirm',
            name: 'confirmed',
            message: prompt,
            default: false,
        });

    return result.confirmed;
};

const deleteAllHosts = async () => {
    const hosts = getHosts();

    if (hosts.length === 0) {
        console.log('No deletion');
        return;
    }

    const confirmed = await isConfirmed('Delete all hosts?');

    if (!confirmed) {
        console.log('No deletion');
        return;
    }

    for (const host of hosts) {
        const configFile = getConfigFile(host);

        if (configFile === null) {
            continue;
        }

        files.deleteFile(configFile);
    }

    console.log('Configuration for all hosts was deleted');
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