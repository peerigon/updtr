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
        .map(outdated => createUpdateTask(outdated, updtr.config))
        .filter(updateTask => filterUpdateTask(updateTask, updtr.config));
}

export default (async function init(updtr) {
    const baseEvent = updtr.config;
    const outdatedCmd = updtr.cmds.outdated();
    const sequence = new Sequence("init", updtr, baseEvent);
    let stdout;

    await sequence.exec("installMissing", updtr.cmds.installMissing());

    try {
        stdout = (await sequence.exec("collect", outdatedCmd)).stdout;
    } catch (err) {
        if (err.code > 1) {
            throw err;
        }

        stdout = err.stdout;
    }

    const updateTasks = getUpdateTasksFromStdout(
        updtr,
        outdatedCmd,
        stdout.trim()
    );

    updtr.emit("initDone", {
        updateTasks,
    });

    return updateTasks;
});
