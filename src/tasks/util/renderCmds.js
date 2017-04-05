export default function renderCmds(updtr, updateTask) {
    const cmds = updtr.cmds;
    const registry = updtr.config.registry;

    return {
        update: cmds.install({
            registry,
            modules: [
                {
                    name: updateTask.name,
                    version: updateTask.updateTo,
                },
            ],
        }),
        test: cmds.test(),
        rollback: cmds.install({
            registry,
            modules: [
                {
                    name: updateTask.name,
                    version: updateTask.updateTo,
                },
            ],
        }),
    };
}
