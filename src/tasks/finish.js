import Sequence from "./util/Sequence";
import { isUpdateToNonBreaking } from "./util/createUpdateTask";

function isIncompleteResult(result) {
    return result.success === true && isUpdateToNonBreaking(result) === true;
}

async function finishIncomplete(sequence, incomplete, allResults) {
    const updtr = sequence.updtr;
    const modulesToCheck = incomplete.map(result => result.name);
    const listCmd = updtr.cmds.list({ modules: modulesToCheck });
    const { stdout } = await sequence.exec("list-incomplete", listCmd);
    const moduleVersions = updtr.parse.list(stdout, listCmd);

    return allResults.map(result => {
        if (isIncompleteResult(result) === false) {
            return result;
        }

        const version = moduleVersions.find(
            module => module.name === result.name
        ).version;

        return {
            ...result,
            updateTo: version,
        };
    });
}

export default (async function finish(updtr, results) {
    const incomplete = results.filter(isIncompleteResult);
    const sequence = new Sequence("finish", updtr);
    let finishedResults = results;

    if (incomplete.length > 0) {
        sequence.start();
        sequence.emit("incomplete", { incomplete });
        try {
            finishedResults = await finishIncomplete(
                sequence,
                incomplete,
                results
            );
        } catch (error) {
            // If something goes wrong here, we don't need to bail out completely
            // because the worst thing that can happen is that the updateTo property is written
            // to the package.json as it is.
            // That's certainly not cool, but better than not updating the package.json at all.
            sequence.emit("non-critical-error", { error });
        }

        sequence.end({ results: finishedResults });
    }

    return finishedResults;
});
