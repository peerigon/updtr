export default function renderCmds(
    { cmds, registry },
    { name, type, updateTo, rollbackTo }
) {
    return {
        update: cmds.install({
            registry,
            name,
            version: updateTo,
            type,
        }),
        test: cmds.test(),
        rollback: cmds.install({
            registry,
            name,
            version: rollbackTo,
            type,
        }),
    };
}
