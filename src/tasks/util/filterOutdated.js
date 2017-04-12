import semver from "semver";
import { UPDATE_TO_LATEST, UPDATE_TO_NON_BREAKING, UPDATE_TO_WANTED} from '../../constants/config';
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
    {
        reason: EXOTIC,
        test: ({ latest }) => latest === "exotic",
    },
    {
        reason: GIT,
        test: ({ latest }) => latest === "git",
    },
    {
        reason: EXCLUDED,
        test: ({ name }, { exclude }) => exclude.some(n => name === n)
    },
    {
        reason: NOT_WANTED,
        test({ current, latest, wanted }, { updateTo }) {
            switch (updateTo) {
                case UPDATE_TO_LATEST:
                    return false;
                case UPDATE_TO_NON_BREAKING:
                    return semver.satisfies(latest, );
            }
        }
    }
    function isNotDesired(updateTask) {
        // In case the updateTo flag was set, updateTo might be the same as rollbackTo
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
