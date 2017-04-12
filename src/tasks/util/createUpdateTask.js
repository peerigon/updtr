import semver from "semver";
import {
    UPDATE_TO_LATEST,
    UPDATE_TO_NON_BREAKING,
    UPDATE_TO_WANTED,
} from "../../constants/config";

function determineUpdateToVersion({ updateTo }, { current, wanted, latest }) {
    switch (updateTo) {
        case UPDATE_TO_LATEST:
            return latest;
        case UPDATE_TO_WANTED:
            return wanted;
        case UPDATE_TO_NON_BREAKING:
    }

    const range = "^" + current;

    if (semver.satisfies(latest, range) === true) {
        return latest;
    }
    if (semver.satisfies(wanted, range) === true) {
        return wanted;
    }

    return current;
}

export default function createUpdateTask(outdated, updtrConfig) {
    return {
        name: outdated.name,
        updateTo: determineUpdateToVersion(updtrConfig, outdated),
        rollbackTo: outdated.current,
    };
}
