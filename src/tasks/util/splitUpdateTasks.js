import semver from "semver";

function isBreaking(diff) {
    return diff !== null && diff !== "minor" && diff !== "patch";
}

export default function splitUpdateTask(updateTasks) {
    return updateTasks.reduce(
        (result, updateTask) => {
            const diff = semver.diff(
                updateTask.rollbackTo,
                updateTask.updateTo
            );

            if (isBreaking(diff) === true) {
                result.breaking.push(updateTask);
            } else {
                result.nonBreaking.push(updateTask);
            }

            return result;
        },
        {
            breaking: [],
            nonBreaking: [],
        }
    );
}
