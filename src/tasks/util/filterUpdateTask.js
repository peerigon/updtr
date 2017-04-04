import semver from "semver";

const exoticDependencies = ["git", "exotic"];

function isExoticDependency(updateTask) {
    return exoticDependencies.indexOf(updateTask.updateTo) !== -1;
}

function isStable(updateTask) {
    // Check for hyphen in version string as this is a pre-release version according to semver
    return updateTask.updateTo.indexOf("-") === -1;
}

function isExcluded(updateTask, exclude) {
    return exclude.some(name => updateTask.name === name);
}

function isConsistent(updateTask) {
    // In rare cases (reasons unknown), the installed version is not lower than the version we are about to updateTo
    // This is the last safe guard against updating to "wrong" versions
    return semver.lt(updateTask.rollbackTo, updateTask.updateTo);
}

export default function filterUpdateTask(updateTask, instanceConfig) {
    return isExoticDependency(updateTask) === false &&
        isStable(updateTask) === true &&
        isExcluded(updateTask, instanceConfig.exclude) === false &&
        isConsistent(updateTask) === true;
}
