"use strict";

const renderCmds = require("../renderCmds");
const createSequence = require("../createSequence");

function updateSingle(instance, updateTask, index, total) {
    let baseEvent;
    let sequence;
    let cmds;

    return Promise.resolve()
        .then(() => {
            baseEvent = Object.assign(
                {
                    current: index + 1,
                    total,
                },
                updateTask
            );
            sequence = createSequence(instance, baseEvent);
            cmds = renderCmds(instance, updateTask);

            return sequence.exec("updating", cmds.update);
        })
        .then(() => sequence.exec("testing", cmds.test))
        .then(
        () => {
            sequence.emit("updatingDone");

            return true;
        },
        () => sequence.exec("rollback", cmds.rollback).then(() => {
            sequence.emit("rollbackDone");

            if (instance.testStdout) {
                sequence.emit("testStdout", {
                    testStdout: sequence.stdouts.test,
                });
            }

            return false;
        })
        );
}

function update(instance, updateTasks) {
    const updateReport = new Map();

    return updateTasks.reduce(
        (promise, updateTask, index) =>
            promise.then(result => {
                if (index > 0) {
                    const previousTask = updateTasks[index - 1];

                    updateReport.set(previousTask.name, result);
                }

                return updateSingle(
                    instance,
                    updateTask,
                    index,
                    updateTasks.length
                );
            }),
        Promise.resolve()
    );
}

module.exports = update;