export default function renderCmds(updtr, updateTasks) {
    const cmds = updtr.cmds;
    const registry = updtr.config.registry;

    return {
        update: cmds.install({
            registry,
            modules: updateTasks.map(updateTask => ({
                name: updateTask.name,
                version: updateTask.updateTo,
            })),
        }),
        test: cmds.test(),
        rollback: cmds.install({
            registry,
            modules: updateTasks.map(updateTask => ({
                name: updateTask.name,
                version: updateTask.rollbackTo,
            })),
        }),
    };
}
