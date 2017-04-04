import Sequence from "../state/Sequence";
import createUpdateTask from "../tasks/util/createUpdateTask";
import filterUpdateTask from "../tasks/util/filterUpdateTask";

function init(instance) {
    const baseEvent = instance.config;
    const outdatedCmd = instance.cmds.outdated();
    let sequence;

    return Promise.resolve()
        .then(() => {
            sequence = new Sequence("init", instance, baseEvent);

            return sequence.exec(
                "installMissing",
                instance.cmds.installMissing()
            );
        })
        .then(() => sequence.exec("collect", outdatedCmd).catch(err => {
            if (err.code > 1) {
                throw err;
            }

            return err;
        }))
        .then(({ stdout }) => {
            const stdoutTrimmed = stdout.trim();

            if (stdoutTrimmed.length === 0) {
                // The result of the init task is an array of update tasks.
                // Hence, we're returning an empty array when there's nothing outdated.
                return [];
            }

            return instance.parse
                .outdated(stdoutTrimmed, outdatedCmd)
                .map(outdated => createUpdateTask(outdated, instance.config))
                .filter(updateTask =>
                    filterUpdateTask(updateTask, instance.config));
        })
        .then(updateTasks => {
            instance.emit("collectDone", {
                updateTasks,
            });

            return updateTasks;
        });
}

export default init;
