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

async function runUpdateTask(sequence, updateTasks, i, previous) {
    const updateResults = await previous;
    const updateTask = updateTasks[i];
    // If the previous update was a failure, we don't need to update now because
    // during the rollback, the next update is also installed in parallel
    const updateNecessary = i === 0 || updateResults[i - 1].success === true;

    sequence.baseEvent = {
        updateTasks: {
            current: i + 1,
            total: updateTasks.length,
        },
        ...updateTask,
    };
    const updtr = sequence.updtr;
    let testResult;

    if (updateNecessary === true) {
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
        const nextUpdateTask = i + 1 < updateTasks.length ?
            updateTasks[i + 1] :
            undefined;

        await sequence.exec(
            "rollback",
            renderRollback(updtr, updateTask, nextUpdateTask)
        );
    }

    return updateResults.concat(createUpdateResult(updateTask, success));
}

export default (async function sequentialUpdate(updtr, updateTasks) {
    const sequence = new Sequence("sequential-update", updtr, {
        updateTasks,
    });

    if (updateTasks.length === 0) {
        return [];
    }

    sequence.start();

    const updateResults = await updateTasks.reduce(
        (updateResults, updateTask, i) =>
            runUpdateTask(sequence, updateTasks, i, updateResults),
        []
    );

    sequence.baseEvent = {
        updateResults,
    };

    sequence.end();

    return updateResults;
});
