import semver from "semver";
import {
    GIT,
    UNSTABLE,
    NOT_WANTED,
    EXCLUDED,
    EXOTIC,
} from "../../constants/filterReasons";
import {isUpdateToNonBreaking} from "./createUpdateTask";

const prePattern = /^pre/;
const reasonTests = [
    {
        name: EXCLUDED,
        test: (updateTask, {exclude}) =>
            exclude.some(name => updateTask.name === name) === true,
    },
    {
        name: GIT,
        test: updateTask => updateTask.updateTo === "git",
    },
    {
        name: EXOTIC,
        test: updateTask => updateTask.updateTo === "exotic",
    },
    {
        name: NOT_WANTED,
        test: updateTask =>
            isUpdateToNonBreaking(updateTask) === false &&
            semver.lte(updateTask.updateTo, updateTask.rollbackTo) === true,
    },
    {
        name: UNSTABLE,
        test(updateTask) {
            if (isUpdateToNonBreaking(updateTask) === true) {
                return null;
            }

            const diff = semver.diff(
                updateTask.rollbackTo,
                updateTask.updateTo
            );
            const unstableTest = diff !== null &&
                prePattern.test(diff) === true &&
                diff !== "prerelease";

            return unstableTest === true;
        },
    },
];
const reasons = reasonTests.map(test => test.name);

export default function filterUpdateTask(updateTask, updtrConfig) {
    const reasonIndex = reasonTests.findIndex(
        reasonTest => reasonTest.test(updateTask, updtrConfig) === true
    );

    return reasonIndex === -1 ? null : reasons[reasonIndex];
}
