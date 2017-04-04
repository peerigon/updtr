"use strict";

function createUpdateTask(outdated, instanceConfig) {
    return {
        name: outdated.name,
        type: outdated.type,
        updateTo: outdated[instanceConfig.updateTo],
        rollbackTo: outdated.current,
    };
}

module.exports = createUpdateTask;
