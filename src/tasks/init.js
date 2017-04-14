import Sequence from "./util/Sequence";
import createUpdateTask from "./util/createUpdateTask";
import filterUpdateTask from "./util/filterUpdateTask";

function getUpdateTasksFromStdout(updtr, outdatedCmd, stdout) {
    if (stdout.length === 0) {
        // When there is not stdout, there is nothing to update
        return [];
    }

    return updtr.parse
        .outdated(stdout, outdatedCmd)
        .map(outdated => createUpdateTask(outdated, updtr.config));
}

export default (async function init(updtr) {
    const baseEvent = { config: updtr.config };
    const outdatedCmd = updtr.cmds.outdated();
    const sequence = new Sequence("init", updtr, baseEvent);
    let stdout;

    sequence.start();

    await sequence.exec(
        "install-missing",
        updtr.cmds.installMissing({
            registry: updtr.config.registry,
        })
    );

    try {
        stdout = (await sequence.exec("collect", outdatedCmd)).stdout;
    } catch (err) {
        // npm exits with zero code 1 when there are outdated dependencies
        // We don't check for the package manager here because yarn might change their
        // behavior in the future to be npm-compatible.
        if (err.code > 1) {
            throw err;
        }

        stdout = err.stdout;
    }

    const allUpdateTasks = getUpdateTasksFromStdout(
        updtr,
        outdatedCmd,
        stdout.trim()
    );
    const filterResults = allUpdateTasks.map(updateTask =>
        filterUpdateTask(updateTask, updtr.config));
    const result = {
        updateTasks: allUpdateTasks.filter(
            (updateTask, index) => filterResults[index] === null
        ),
        excluded: allUpdateTasks.reduce(
            (excluded, updateTask, index) => {
                const reason = filterResults[index];

                if (reason === null) {
                    return excluded;
                }

                return excluded.concat({
                    ...updateTask,
                    reason,
                });
            },
            []
        ),
    };

    sequence.end(result);

    return result;
});
