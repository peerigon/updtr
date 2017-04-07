import renderCmds from "./util/renderCmds";
import Sequence from "./util/Sequence";
import createUpdateResult from "./util/createUpdateResult";

async function updateSingle(sequence, updateTask) {
    const cmds = renderCmds(sequence.updtr, [updateTask]);
    let testResult;

    await sequence.exec("updating", cmds.update);

    try {
        testResult = await sequence.exec("testing", cmds.test);
    } catch (err) {
        testResult = err;
    }

    const success = testResult instanceof Error === false;

    sequence.baseEvent.success = success;

    sequence.emit("test-result", {
        stdout: testResult.stdout,
    });

    if (success === false) {
        await sequence.exec("rollback", cmds.rollback);
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
