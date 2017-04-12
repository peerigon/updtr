import semver from "semver";
import {
    GIT,
    UNSTABLE,
    NOT_WANTED,
    EXCLUDED,
    EXOTIC,
} from "../../../src/constants/filterReasons";

// We use an empty string as false flag so that our test functions do always return a string.
// This way they can be optimized by the compiler.
const FALSE = "";
const prePattern = /^pre/;
const tests = [
    function isExoticDependency(updateTask) {
        return updateTask.updateTo === "exotic" ? EXOTIC : FALSE;
    },
    function isGitDependency(updateTask) {
        return updateTask.updateTo === "git" ? GIT : FALSE;
    },
    function isExcluded(updateTask, { exclude }) {
        return exclude.some(name => updateTask.name === name) === true ?
            EXCLUDED :
            FALSE;
    },
    function isNotWanted(updateTask) {
        // In case the updateTo option is not UPDATE_TO_LATEST, there might be noop update tasks
        return semver.lte(updateTask.updateTo, updateTask.rollbackTo) === true ?
            NOT_WANTED :
            FALSE;
    },
    function isUnstable(updateTask) {
        const diff = semver.diff(updateTask.rollbackTo, updateTask.updateTo);
        const unstableTest = diff !== null &&
            prePattern.test(diff) === true &&
            diff !== "prerelease";

        return unstableTest === true ? UNSTABLE : FALSE;
    },
];

export default function filterUpdateTask(updateTask, updtrConfig) {
    for (const test of tests) {
        const testResult = test(updateTask, updtrConfig);

        if (testResult !== FALSE) {
            return testResult;
        }
    }

    return null;
}
