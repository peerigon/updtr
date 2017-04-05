import init from "./tasks/init";
import sequentialUpdate from "./tasks/sequentialUpdate";

export default (async function run(updtr) {
    updtr.emit("start", {
        config: updtr.config,
    });

    const { updateTasks } = await init(updtr);
    const updateResults = await sequentialUpdate(updtr, updateTasks);

    updtr.emit("end", {
        config: updtr.config,
        results: updateResults,
    });
});
