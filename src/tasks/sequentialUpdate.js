import Sequence from "./util/Sequence";
import createUpdateResult from "./util/createUpdateResult";
import updateTo from "./util/updateTo";
import rollbackTo from "./util/rollbackTo";

function renderUpdate(updtr, updateTask) {
    return updtr.cmds.install({
        registry: updtr.config.registry,
        modules: [updateTo(updateTask)],
    });
}

function renderTest(updtr) {
    return updtr.cmds.test();
}

function renderRollback(updtr, failedUpdateTask, nextUpdateTask) {
    const modules = [rollbackTo(failedUpdateTask)];

    if (nextUpdateTask !== undefined) {
        modules.push(updateTo(nextUpdateTask));
    }

    return updtr.cmds.install({
        registry: updtr.config.registry,
        modules,
    });
}

export default (async function sequentialUpdate(updtr, updateTasks) {
    const sequence = new Sequence("sequential-update", updtr, {
        updateTasks,
    });
    const updateResults = [];

    if (updateTasks.length === 0) {
        return updateResults;
    }

    sequence.start();

    for (let i = 0; i < updateTasks.length; i++) {
        const updateTask = updateTasks[i];

        sequence.baseEvent = {
            updateTasks: {
                current: i + 1,
                total: updateTasks.length,
            },
            ...updateTask,
        };
        const updtr = sequence.updtr;
        let testResult;

        if (i === 0 || updateResults[i - 1].success === true) {
            await sequence.exec("updating", renderUpdate(updtr, updateTask));
        }

        try {
            testResult = await sequence.exec("testing", renderTest(updtr));
        } catch (err) {
            testResult = err;
        }

        const success = testResult instanceof Error === false;

        sequence.baseEvent.success = success;
        sequence.emit("test-result", {
            stdout: testResult.stdout,
        });

        if (success === false) {
            await sequence.exec(
                "rollback",
                renderRollback(updtr, updateTask, updateTasks[i + 1])
            );
        }

        updateResults.push(createUpdateResult(updateTask, success));
    }

    sequence.baseEvent = {
        updateResults,
    };

    sequence.end();

    return updateResults;
});
