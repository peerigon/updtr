import {
    UPDATE_TO_LATEST,
    UPDATE_TO_NON_BREAKING,
    UPDATE_TO_WANTED,
} from "../../constants/config";

function determineUpdateToVersion({ current, wanted, latest }, { updateTo }) {
    switch (updateTo) {
        case UPDATE_TO_LATEST:
            return latest;
        case UPDATE_TO_WANTED:
            return wanted;
        case UPDATE_TO_NON_BREAKING:
        default:
            return "^" + current;
    }
}

export function isUpdateToNonBreaking(updateTask) {
    return updateTask.updateTo === "^" + updateTask.rollbackTo;
}

export default function createUpdateTask(outdated, updtrConfig) {
    return {
        name: outdated.name,
        updateTo: determineUpdateToVersion(outdated, updtrConfig),
        rollbackTo: outdated.current,
    };
}
