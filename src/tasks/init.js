"use strict";

const createSequence = require("../createSequence");
const createUpdateTask = require("../createUpdateTask");
const filterUpdateTask = require("../filterUpdateTask");

function init(instance) {
    const baseEvent = instance.config;
    let sequence;

    return Promise.resolve()
        .then(() => {
            sequence = createSequence(instance, baseEvent);

            return sequence.exec(
                "installMissing",
                instance.cmds.installMissing()
            );
        })
        .then(() =>
            sequence.exec("collect", instance.cmds.outdated()).catch(err => {
                if (err.code > 1) {
                    throw err;
                }
            }))
        .then(() => {
            const stdout = sequence.stdouts.outdated.trim();

            if (stdout.length === 0) {
                // The result of the init task is an array of update tasks.
                // Hence, we're returning an empty array when there's nothing outdated.
                return [];
            }

            return instance.parse
                .outdated(stdout)
                .map(outdated => createUpdateTask(instance, outdated))
                .filter(updateTask =>
                    filterUpdateTask(updateTask, instance.config));
        })
        .then(updateTasks => {
            instance.emit("collectDone", {
                updateTasks,
            });

            return updateTasks;
        });
}

module.exports = init;
