export function renderUpdate(updtr, updateTasks) {
    return updtr.cmds.install({
        registry: updtr.config.registry,
        modules: updateTasks.map(updateTask => ({
            name: updateTask.name,
            version: updateTask.updateTo,
        })),
    });
}

export function renderTest(updtr) {
    return updtr.cmds.test();
}

export function renderRollback(updtr, updateTasks) {
    return updtr.cmds.install({
        registry: updtr.config.registry,
        modules: updateTasks.map(updateTask => ({
            name: updateTask.name,
            version: updateTask.rollbackTo,
        })),
    });
}
