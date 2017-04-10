import init from "./tasks/init";
import sequentialUpdate from "./tasks/sequentialUpdate";
import splitUpdateTasks from "./tasks/util/splitUpdateTasks";
import batchUpdate from "./tasks/batchUpdate";
import createUpdateResult from "./tasks/util/createUpdateResult";

async function runBatchUpdate(updtr, nonBreaking) {
    const batchSuccess = await batchUpdate(updtr, nonBreaking);
    const batchUpdateWasSufficient = batchSuccess === true ||
        nonBreaking.length < 2;

    return batchUpdateWasSufficient === true ?
        nonBreaking.map(updateTask =>
              createUpdateResult(updateTask, batchSuccess)) :
        [];
}

function runSequentialUpdate(updtr, batchUpdateResults, nonBreaking, breaking) {
    const batchUpdateWasSufficient = batchUpdateResults.length ===
        nonBreaking.length;

    return sequentialUpdate(
        updtr,
        (batchUpdateWasSufficient === true ? [] : nonBreaking).concat(breaking)
    );
}

export default (async function run(updtr) {
    updtr.emit("start", {
        config: updtr.config,
    });

    const { updateTasks } = await init(updtr);
    const { breaking, nonBreaking } = splitUpdateTasks(updateTasks);

    const batchUpdateResults = await runBatchUpdate(updtr, nonBreaking);
    const sequentialUpdateResults = await runSequentialUpdate(
        updtr,
        batchUpdateResults,
        nonBreaking,
        breaking
    );

    updtr.emit("end", {
        config: updtr.config,
        results: batchUpdateResults.concat(sequentialUpdateResults),
    });
});
