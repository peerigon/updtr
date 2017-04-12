import {
    GIT,
    EXOTIC,
    UNSTABLE,
    EXCLUDED,
    NOT_DESIRED,
    ALL,
} from "../../constants/filterReasons";

const reasonNames = {
    [GIT]: "Git dependencies",
    [EXOTIC]: "Exotic dependencies",
    [UNSTABLE]: "Update to unstable version",
    [EXCLUDED]: "In exclude list",
    [NOT_DESIRED]: "Breaking update",
};

export default function excludedList(excluded) {
    return (
        excluded
            .reduce(
            (excludedByReason, updateTask) => {
                const reasonIndex = ALL.indexOf(updateTask.reason);
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
                    reasonNames[ALL[index]] + ": " + excludedByReason.join(", ")
            )
            // Filter undefined values in sparse array
            .filter(s => typeof s === "string")
    );
}
