import Sequence from "../state/Sequence";
import createUpdateTask from "../tasks/util/createUpdateTask";
import filterUpdateTask from "../tasks/util/filterUpdateTask";

function getUpdateTasksFromStdout(instance, outdatedCmd, stdout) {
    if (stdout.length === 0) {
        // When there is not stdout, there is nothing to update
        return [];
    }

    return instance.parse
        .outdated(stdout, outdatedCmd)
        .map(outdated => createUpdateTask(outdated, instance.config))
        .filter(updateTask => filterUpdateTask(updateTask, instance.config));
}

export default (async function init(instance) {
    const baseEvent = instance.config;
    const outdatedCmd = instance.cmds.outdated();
    const sequence = new Sequence("init", instance, baseEvent);
    let stdout;

    await sequence.exec("installMissing", instance.cmds.installMissing());

    try {
        stdout = (await sequence.exec("collect", outdatedCmd)).stdout;
    } catch (err) {
        if (err.code > 1) {
            throw err;
        }

        stdout = err.stdout;
    }

    const updateTasks = getUpdateTasksFromStdout(
        instance,
        outdatedCmd,
        stdout.trim()
    );

    instance.emit("initDone", {
        updateTasks,
    });

    return updateTasks;
});
