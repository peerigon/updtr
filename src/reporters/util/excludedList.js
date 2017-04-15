import {
    GIT,
    EXOTIC,
    UNSTABLE,
    EXCLUDED,
    NOT_WANTED,
} from "../../constants/filterReasons";

const REASONS = [GIT, EXOTIC, UNSTABLE, EXCLUDED, NOT_WANTED];
const reasonNames = {
    [GIT]: "git",
    [EXOTIC]: "exotic",
    [UNSTABLE]: "unstable latest",
    [EXCLUDED]: "in exclude list",
    [NOT_WANTED]: "update not wanted",
};

export default function excludedList(excluded) {
    return (
        excluded
            .reduce(
            (excludedByReason, updateTask) => {
                const reasonIndex = REASONS.indexOf(updateTask.reason);
                const excluded = excludedByReason[reasonIndex];

                if (excluded === undefined) {
                    excludedByReason[reasonIndex] = [updateTask.name];
                } else {
                    excluded.push(updateTask.name);
                }

                return excludedByReason;
            },
                []
            )
            .map(
            (excludedByReason, index) =>
                    reasonNames[REASONS[index]] +
                    ": " +
                    excludedByReason.join(", ")
            )
            // Filter undefined values in sparse array
            .filter(s => typeof s === "string")
    );
}
