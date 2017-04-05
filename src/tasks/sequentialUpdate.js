import renderCmds from "./util/renderCmds";
import Sequence from "./util/Sequence";
import createUpdateResult from "./util/createUpdateResult";

async function updateSingle(sequence, updateTask, index, total) {
    const cmds = renderCmds(sequence.updtr, updateTask);
    let testResult;

    sequence.baseEvent = {
        ...updateTask,
        current: index + 1,
        total,
    };

    await sequence.exec("updating", cmds.update);

    try {
        testResult = await sequence.exec("testing", cmds.test);
    } catch (err) {
        testResult = err;
    }

    const success = testResult instanceof Error === false;

    sequence.emit("testResult", {
        success,
        stdout: testResult.stdout,
    });

    if (success === false) {
        await sequence.exec("rollback", cmds.rollback);
    }

    return createUpdateResult(updateTask, success);
}

export default (async function sequentialUpdate(updtr, updateTasks) {
    const sequence = new Sequence("sequentialUpdate", updtr);
    const updateResults = [];

    sequence.start();

    for (const updateTask of updateTasks) {
        // This must be sequential, thus await inside the loop is ok
        updateResults.push(await updateSingle(sequence, updateTask)); // eslint-disable-line no-await-in-loop
    }

    sequence.end();

    return updateResults;
});
