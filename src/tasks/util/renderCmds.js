"use strict";

function renderCmds(instance, updateTask) {
    return {
        update: instance.cmds.install({
            registry: instance.registry,
            name: updateTask.name,
            version: updateTask.updateTo,
            type: updateTask.type,
        }),
        test: instance.cmds.test(),
        rollback: instance.cmds.install({
            registry: instance.registry,
            name: updateTask.name,
            version: updateTask.rollbackTo,
            type: updateTask.type,
        }),
    };
}

module.exports = renderCmds;
