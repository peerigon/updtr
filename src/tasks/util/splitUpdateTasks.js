import semver from "semver";
import { isUpdateToNonBreaking } from "./createUpdateTask";

function isBreaking(updateTask) {
    return isUpdateToNonBreaking(updateTask) === false &&
        semver.satisfies(updateTask.updateTo, "^" + updateTask.rollbackTo) ===
            false;
}

export default function splitUpdateTask(updateTasks) {
    const breaking = [];
    const nonBreaking = [];

    for (const updateTask of updateTasks) {
        (isBreaking(updateTask) === true ? breaking : nonBreaking).push(
            updateTask
        );
    }

    return {
        breaking,
        nonBreaking,
    };
}
