"use strict";

function createUpdateTask(instance, outdated) {
    return {
        name: outdated.name,
        type: outdated.type,
        updateTo: instance.wanted ? outdated.wanted : outdated.latest,
        rollbackTo: outdated.current,
    };
}

module.exports = createUpdateTask;
