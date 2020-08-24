#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');


const _ = require('lodash');

const inquirer = require('inquirer');

const lib = require('./lib');

const manager = require('./manager');

const printHeader = () => {
    console.log(
        chalk.yellow(
            figlet.textSync('Nginx Host Manager', { horizontalLayout: 'full' })
        )
    );

    lib.newline();
};

const selectAction = async (actions) => {
    let results = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What should I do',
            choices: actions,
            pageSize: 50
        }
    ]);
    lib.newline();

    return results.action;
};

const mainLoop = async () => {
    let running = true;
    while (running) {
        clear();
        printHeader();

        const selectedAction = await selectAction([
            'Show status',
            'Create host',
            'Delete host',
            'Change port',
            'Disable host',
            'Enable host',
            'Start proxy',
            'Stop proxy',
            'Restart proxy',
            'Reload Nginx configuration',
            'Delete all hosts',
            'Exit',
        ]);

        if (selectedAction === 'Show status') {
            await manager.showStatus();
        }

        if (selectedAction === 'Create host') {
            await manager.createHost();
        }

        if (selectedAction === 'Delete host') {
            await manager.deleteHost();
        }

        if (selectedAction === 'Change port') {
            await manager.changePort();
        }

        if (selectedAction === 'Disable host') {
            await manager.disableHost();
        }

        if (selectedAction === 'Enable host') {
            await manager.enableHost();
        }

        if (selectedAction === 'Start proxy') {
            await manager.startProxy();
        }

        if (selectedAction === 'Stop proxy') {
            await manager.stopProxy();
        }

        if (selectedAction === 'Restart proxy') {
            await manager.restartProxy();
        }

        if (selectedAction === 'Reload Nginx configuration') {
            await manager.reloadNginx();
        }

        if (selectedAction === 'Delete all hosts') {
            await manager.deleteAllHosts();
        }

        if (selectedAction === 'Exit') {
            running = false;
        }

        if (running) {
            await lib.keypress();
        }
    }
};

mainLoop().then();