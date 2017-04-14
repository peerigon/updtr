import init from "./tasks/init";
import sequentialUpdate from "./tasks/sequentialUpdate";
import splitUpdateTasks from "./tasks/util/splitUpdateTasks";
import batchUpdate from "./tasks/batchUpdate";
import createUpdateResult from "./tasks/util/createUpdateResult";
import finish from "./tasks/finish";
import updatePackageJson from "./tasks/updatePackageJson";

async function runUpdateTasks(updtr, updateTasks) {
    const results = [];
    const { breaking, nonBreaking } = splitUpdateTasks(updateTasks);
    const sequentialUpdateTasks = breaking.slice();
    let batchSuccess = false;

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

    return finish(updtr, results);
}

export default (async function run(updtr) {
    const results = [];

    updtr.emit("start", {
        config: updtr.config,
    });

    const { updateTasks } = await init(updtr);

    if (updateTasks.length > 0) {
        results.push(...(await runUpdateTasks(updtr, updateTasks)));
        await updatePackageJson(updtr, results);
    }

    updtr.emit("end", {
        config: updtr.config,
        results,
    });

    return results;
});
