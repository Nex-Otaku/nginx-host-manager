const files = require('./files');
const chalk = require('chalk');
const lib = require('./lib');
const inquirer = require('inquirer');
const docker = require('./docker');

const proxyImageName = 'reverse-proxy-image';
const proxyContainerName = 'reverse-proxy';

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

const getProxyFolderPath = () => {
    return files.getCurrentDirectory() + '\\reverse-proxy';
}

const getSitesPath = () => {
    return getProxyFolderPath() + '\\sites';
};

const getProxyContainerInfo = async () => {
    const infos = await docker.inspectContainer(proxyContainerName);

    if (infos.length < 1) {
        return null;
    }

    let foundInfo = null;

    for (const info of infos) {
        if (info.Name === '/' + proxyContainerName) {
            foundInfo = info;

            break;
        }
    }

    return foundInfo;
};

const getProxyImageInfo = async () => {
    const infos = await docker.inspectImage(proxyImageName);

    if (infos.length < 1) {
        return null;
    }

    let foundInfo = null;

    for (const info of infos) {
        const repoTags = info.RepoTags;

        if (!Array.isArray(repoTags) || (repoTags.length < 1)) {
            continue;
        }

        const repoTag = repoTags[0];
        const expectedRepoTag = proxyImageName + ':latest';

        if (repoTag !== expectedRepoTag) {
            continue;
        }

        foundInfo = info;
        break;
    }

    return foundInfo;
};

const isProxyOnline = async () => {
    const foundInfo = await getProxyContainerInfo();

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

const isProxyStopped = async () => {
    const foundInfo = await getProxyContainerInfo();

    if (foundInfo === null) {
        return false;
    }

    return foundInfo.State.Status === 'exited';
};

const startProxyContainer = async () => {
    const command = 'docker start ' + proxyContainerName;

    return lib.shellRun(command);
};

const existsProxyImage = async () => {
    const foundInfo = await getProxyImageInfo();

    return foundInfo !== null;
};

const buildProxyImage = async () => {
    return docker.buildImage(proxyImageName, getProxyFolderPath());
};

const makeForwardSlashes = (path) => {
    return path.replace(/\\/g, '/');
};

const runProxyContainer = async () => {
    const proxyDir = makeForwardSlashes(getProxyFolderPath());

    const command = 'docker run -d'
        + ' --name ' + proxyContainerName
        + ' -p 80:80'
        + ' --mount type=bind,source="' + proxyDir + '/cert",target=/etc/ssl'
        + ' --mount type=bind,source="' + proxyDir + '/includes",target=/etc/nginx/includes'
        + ' --mount type=bind,source="' + proxyDir + '/sites",target=/etc/nginx/sites'
        + ' ' + proxyImageName;

    return lib.shellRun(command);
}

const stopProxyContainer = async () => {
    const command = 'docker stop ' + proxyContainerName;

    return lib.shellRun(command);
}

const getHosts = () => {
    return []
        .concat(getEnabledHosts())
        .concat(getDisabledHosts());
};

const getEnabledHosts = () => {
    let hosts = [];
    const sitesPath = getSitesPath();

    const enabledSites = files.getFilesWithPattern(sitesPath, '.*\.conf$');

    for (const site of enabledSites) {
        hosts.push(site.replace('.conf', ''));
    }

    return hosts;
};

const getDisabledHosts = () => {
    let hosts = [];
    const sitesPath = getSitesPath();

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

const isConfirmed = async (prompt) => {
    const result = await inquirer.prompt({
        type: 'confirm',
        name: 'confirmed',
        message: prompt,
        default: false,
    });

    return result.confirmed;
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

const execProxyContainer = async (command) => {
    const dockerCommand = 'docker exec ' + proxyContainerName + ' ' + command;

    return lib.shellRun(dockerCommand, ['signal process started']);
};

const renameFile = (from, to) => {
    if (!files.fileExists(from)) {
        console.log('Not found source file');

        return;
    }

    if (files.fileExists(to)) {
        console.log('Destination file already exists');

        return;
    }

    files.renameFile(from, to);
};

const createConfig = (host, port) => {
    let config = files.readFile(getProxyFolderPath() + '\\host-template.conf');

    config = config.replace(/%HOST%/g, host);
    config = config.replace(/%PORT%/g, port);

    files.writeFile(getEnabledConfigFile(host), config);
};

const inputHost = async () => {
    return (await inquirer.prompt({
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
};

const inputPort = async () => {
    return (await inquirer.prompt({
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
};

// ****************************************************
// Public Methods
// ****************************************************

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

const createHost = async () => {
    const host = await inputHost();
    const port = await inputPort();

    createConfig(host, port);
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
    const hosts = getHosts();
    const host = await selectHost('Host to change port', hosts);

    if (host === '') {
        console.log('No host selected');

        return;
    }

    const port = await inputPort();

    const configFile = getConfigFile(host);

    if (configFile !== null) {
        files.deleteFile(configFile);
    }

    createConfig(host, port);
};

const disableHost = async () => {
    const hosts = getEnabledHosts();
    const host = await selectHost('Host to disable', hosts);

    if (host === '') {
        console.log('No host selected');

        return;
    }

    renameFile(getEnabledConfigFile(host), getDisabledConfigFile(host));
};

const enableHost = async () => {
    const hosts = getDisabledHosts();
    const host = await selectHost('Host to enable', hosts);

    if (host === '') {
        console.log('No host selected');

        return;
    }

    renameFile(getDisabledConfigFile(host), getEnabledConfigFile(host));
};

const startProxy = async () => {
    const proxyOnline = await isProxyOnline();

    if (proxyOnline) {
        return;
    }

    const proxyStopped = await isProxyStopped();

    if (proxyStopped) {
        console.log('Starting container...');
        await startProxyContainer();
        console.log('Done.');

        return;
    }

    const proxyImageExists = await existsProxyImage();

    if (!proxyImageExists) {
        console.log('Proxy image not found. Building...');

        try {
            await buildProxyImage();
        } catch (error) {
            console.log('Failed to build proxy image.');

            return;
        }

        console.log('Successfully built image.');
    }

    console.log('Starting container...');
    await runProxyContainer();
    console.log('Done.');
};

const stopProxy = async () => {
    const proxyOnline = await isProxyOnline();

    if (!proxyOnline) {
        return;
    }

    console.log('Stopping container...');
    await stopProxyContainer();
    console.log('Done.');
};

const restartProxy = async () => {
    await stopProxy();
    await startProxy();
};

const reloadNginx = async () => {
    const proxyOnline = await isProxyOnline();

    if (!proxyOnline) {
        console.log('Container is not running, nothing to reload');

        return;
    }

    console.log('Reloading Nginx configuration...');
    await execProxyContainer('nginx -s reload');
    console.log('Done.');
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