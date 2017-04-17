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

async function runUpdateTask(sequence, updateTasks, i, previousUpdateResults) {
    const updateResults = await previousUpdateResults;
    const previousUpdateResult = updateResults[updateResults.length - 1];
    const updateTask = updateTasks[i];
    // If the previous update was a failure, we don't need to update now because
    // during the rollback, the next update is also installed in parallel
    const updateNecessary = previousUpdateResult === undefined ?
        true :
        previousUpdateResult.success === true;

    sequence.baseEvent = {
        updateTasks: {
            current: i + 1,
            total: updateTasks.length,
        },
        ...updateTask,
    };
    const updtr = sequence.updtr;
    let testResult;
    let success;

    if (updateNecessary === true) {
        await sequence.exec("updating", renderUpdate(updtr, updateTask));
    }

    try {
        testResult = await sequence.exec("testing", renderTest(updtr));
        success = true;
    } catch (err) {
        // Remember: instanceof Error might not work in Jest as expected
        // https://github.com/facebook/jest/issues/2549
        testResult = err;
        success = false;
    }

    sequence.baseEvent.success = success;

    if (success === false) {
        const nextUpdateTask = i + 1 < updateTasks.length ?
            updateTasks[i + 1] :
            undefined;

        await sequence.exec(
            "rollback",
            renderRollback(updtr, updateTask, nextUpdateTask)
        );
    }

    const result = createUpdateResult(updateTask, success);

    sequence.emit("result", {
        stdout: testResult.stdout,
        ...result,
    });

    return updateResults.concat();
}

export default (async function sequentialUpdate(
    updtr,
    updateTasks,
    previousUpdateResult
) {
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
        previousUpdateResult === undefined ? [] : [previousUpdateResult]
    );

    if (previousUpdateResult !== undefined) {
        // The previousUpdateResult is the first element in the updateResults array, so let's remove it.
        updateResults.shift();
    }

    sequence.baseEvent = {
        updateResults,
    };

    sequence.end();

    return updateResults;
});
