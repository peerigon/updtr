import { renderUpdate, renderTest, renderRollback } from "./util/renderCmds";
import Sequence from "./util/Sequence";
import createUpdateResult from "./util/createUpdateResult";

async function updateSingle(sequence, updateTask) {
    const updtr = sequence.updtr;
    let testResult;

    await sequence.exec("updating", renderUpdate(updtr, [updateTask]));

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
        await sequence.exec("rollback", renderRollback(updtr, [updateTask]));
    }

    return createUpdateResult(updateTask, success);
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
        // This must be sequential, thus await inside the loop is ok
        updateResults.push(
            await updateSingle(sequence, updateTask) // eslint-disable-line no-await-in-loop
        );
    }

    sequence.baseEvent = {
        updateResults,
    };

    sequence.end();

    return updateResults;
});
