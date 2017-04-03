"use strict";

const semver = require("semver");

const exoticDependencies = ["git", "exotic"];

function isExoticDependency(updateTask) {
    return exoticDependencies.indexOf(updateTask.updateTo) !== -1;
}

function isAlreadyInstalled(updateTask) {
    return updateTask.updateTo === updateTask.rollbackTo;
}

function isUnstable(updateTask) {
    // Check for hyphen in version string as this is a pre-release version according to SemVer
    return updateTask.updateTo.indexOf("-") !== -1;
}

function isExcluded(updateTask, exclude) {
    return exclude.some(name => updateTask.name === name);
}

function isCurrentGreaterThanUpdateTo(updateTask) {
    return semver.gt(updateTask.rollbackTo, updateTask.updateTo);
}

function filterUpdateTask(updateTask, instanceConfig) {
    return isExoticDependency(updateTask) === false &&
        isAlreadyInstalled(updateTask) === false &&
        isUnstable(updateTask) === false &&
        isExcluded(updateTask, instanceConfig.exclude) === false &&
        isCurrentGreaterThanUpdateTo(updateTask) === false;
}

module.exports = filterUpdateTask;
