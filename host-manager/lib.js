const exec = require('child-process-promise').exec;

const _ = require('lodash');

const pressAnyKey = require('press-any-key');

module.exports = {
    shellRun: async (command, ignoredMessages) => {
        return exec(command)
            .then(function (result) {
                var stderr = result.stderr;
                if (stderr.length > 0) {
                    throw new Error(stderr);
                }
                return result.stdout;
            })
            .catch(function (err) {
                if (Array.isArray(ignoredMessages)) {
                    for (ignoredMessage of ignoredMessages) {
                        if (err.message.includes(ignoredMessage)) {
                            return;
                        }
                    }
                }

                console.error('ERROR: ', err);
            });
    },

    newline: () => {
        console.log();
    },

    keypress: async () => {
        console.log();
        return pressAnyKey('Press any key...');
    }
};