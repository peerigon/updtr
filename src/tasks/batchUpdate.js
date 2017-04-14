import Sequence from "./util/Sequence";
import updateTo from "./util/updateTo";
import rollbackTo from "./util/rollbackTo";

function renderUpdate(updtr, updateTask) {
    return updtr.cmds.install({
        registry: updtr.config.registry,
        modules: updateTask.map(updateTo),
    });
}

function renderTest(updtr) {
    return updtr.cmds.test();
}

function renderRollback(updtr, failedUpdateTasks) {
    return updtr.cmds.install({
        registry: updtr.config.registry,
        modules: failedUpdateTasks.map(rollbackTo),
    });
}

async function update(sequence, updateTasks) {
    const updtr = sequence.updtr;
    let success;
    let testResult;

    await sequence.exec("updating", renderUpdate(updtr, updateTasks));
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
    sequence.emit("test-result", {
        stdout: testResult.stdout,
    });
    if (success === false) {
        await sequence.exec("rollback", renderRollback(updtr, updateTasks));
    }

    return success;
}

export default (async function batchUpdate(updtr, updateTasks) {
    const sequence = new Sequence("batch-update", updtr, {
        updateTasks,
    });
    let success = true;

    if (updateTasks.length > 0) {
        sequence.start();
        success = await update(sequence, updateTasks);
        sequence.baseEvent = {
            success,
        };
        sequence.end();
    }

    return success;
});
