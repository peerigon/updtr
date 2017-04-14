import semver from "semver";

function diffIsBreaking(diff) {
    return diff !== null && diff !== "minor" && diff !== "patch";
}

export default function splitUpdateTask(updateTasks) {
    return updateTasks.reduce(
        (result, updateTask) => {
            const updateToIsRange = semver.valid(updateTask.updateTo) === null;
            const isBreaking = updateToIsRange === true ?
                semver.satisfies(
                    updateTask.rollbackTo,
                    updateTask.updateTo
                  ) === false :
                diffIsBreaking(
                    semver.diff(updateTask.rollbackTo, updateTask.updateTo)
                  ) === true;

            (isBreaking === true ? result.breaking : result.nonBreaking).push(
                updateTask
            );

            return result;
        },
        {
            breaking: [],
            nonBreaking: [],
        }
    );
}
