import init from "./tasks/init";
import sequentialUpdate from "./tasks/sequentialUpdate";
import splitUpdateTasks from "./tasks/util/splitUpdateTasks";
import batchUpdate from "./tasks/batchUpdate";
import createUpdateResult from "./tasks/util/createUpdateResult";

export default (async function run(updtr) {
    const results = [];
    let batchSuccess = false;

    updtr.emit("start", {
        config: updtr.config,
    });

    const { updateTasks } = await init(updtr);
    const { breaking, nonBreaking } = splitUpdateTasks(updateTasks);
    const sequentialUpdateTasks = breaking.slice();

    if (nonBreaking.length > 1) {
        batchSuccess = await batchUpdate(updtr, nonBreaking);
    }
    if (batchSuccess === true) {
        results.push(
            ...nonBreaking.map(updateTask =>
                createUpdateResult(updateTask, true))
        );
    } else {
        sequentialUpdateTasks.unshift(...nonBreaking);
    }
    results.push(...(await sequentialUpdate(updtr, sequentialUpdateTasks)));

    updtr.emit("end", {
        config: updtr.config,
        results,
    });

    return results;
});
