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

    return (
        allResults
            .map(result => {
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
            })
            // Remove results where no actual update did happen.
            // These results can happen if the updateTo option was set to non-breaking
            // and the module did not have a new version for the rollbackTo version range.
            .filter(result => result.rollbackTo !== result.updateTo)
    );
}

export default (async function finish(updtr, results) {
    const incomplete = results.filter(isIncompleteResult);
    const sequence = new Sequence("finish", updtr);
    let finishedResults = results;

    if (incomplete.length > 0) {
        sequence.start();
        sequence.emit("incomplete", { incomplete });
        finishedResults = await finishIncomplete(sequence, incomplete, results);
        sequence.end({ results: finishedResults });
    }

    return finishedResults;
});
