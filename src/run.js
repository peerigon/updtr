import init from "./tasks/init";
import sequentialUpdate from "./tasks/sequentialUpdate";
import splitUpdateTasks from "./tasks/util/splitUpdateTasks";
import batchUpdate from "./tasks/batchUpdate";
import createUpdateResult from "./tasks/util/createUpdateResult";

export default (async function run(updtr) {
    updtr.emit("start", {
        config: updtr.config,
    });

    const { updateTasks } = await init(updtr);
    const { breaking, nonBreaking } = splitUpdateTasks(updateTasks);
    const batchSuccess = await batchUpdate(updtr, nonBreaking);
    const batchUpdateResults = batchSuccess === true ?
        nonBreaking.map(updateTask => createUpdateResult(updateTask, true)) :
        [];
    const sequentialUpdateResults = await sequentialUpdate(
        updtr,
        (batchSuccess ? [] : nonBreaking).concat(breaking)
    );

    updtr.emit("end", {
        config: updtr.config,
        results: batchUpdateResults.concat(sequentialUpdateResults),
    });
});
