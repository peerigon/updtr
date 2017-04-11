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
    let testResult;

    await sequence.exec("updating", renderUpdate(updtr, updateTasks));

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
        await sequence.exec("rollback", renderRollback(updtr, updateTasks));
    }

    return success;
}

export default (async function batchUpdate(updtr, updateTasks) {
    const sequence = new Sequence("batch-update", updtr, {
        updateTasks,
    });

    if (updateTasks.length === 0) {
        return [];
    }

    sequence.start();

    const success = await update(sequence, updateTasks);

    sequence.baseEvent = {
        success,
    };

    sequence.end();

    return success;
});
