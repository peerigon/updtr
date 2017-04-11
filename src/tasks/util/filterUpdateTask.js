import semver from "semver";
import {
    GIT,
    UNSTABLE,
    NOT_DESIRED,
    EXCLUDED,
    EXOTIC,
} from "../../../src/constants/filterReasons";

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
    function isNotDesired(updateTask) {
        // In case the nonBreaking flag was set, updateTo might be the same as rollbackTo
        return semver.gt(updateTask.updateTo, updateTask.rollbackTo) === false ?
            NOT_DESIRED :
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
