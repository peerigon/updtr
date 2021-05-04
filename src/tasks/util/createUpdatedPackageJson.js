import {SAVE_CARET, SAVE_EXACT, SAVE_SMART} from "../../constants/config";
import updateVersionRange from "./updateVersionRange";
import {filterSuccessfulUpdates} from "./filterUpdateResults";

const dependencyTypes = [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
];

function newVersionRange(updtrConfig, oldVersionRange, update) {
    switch (updtrConfig.save) {
        case SAVE_CARET:
            return "^" + update.updateTo;
        case SAVE_EXACT:
            return update.updateTo;
        case SAVE_SMART:
    }

    return updateVersionRange(oldVersionRange, update.updateTo);
}

export default function createUpdatedPackageJson(
    oldPackageJson,
    updateResults,
    updtrConfig
) {
    const newPackageJson = {...oldPackageJson};
    const successfulUpdates = filterSuccessfulUpdates(updateResults);
    let dependenciesToSave = successfulUpdates;

    dependencyTypes
        .filter(type => oldPackageJson[type] !== undefined)
        .forEach(type => {
            const dependencies = oldPackageJson[type];
            const newDependencies = {};

            Object.keys(dependencies).forEach(moduleName => {
                const update = successfulUpdates.find(
                    ({name}) => name === moduleName
                );

                const oldVersionRange = dependencies[moduleName];

                newDependencies[moduleName] = update === undefined ?
                    oldVersionRange :
                    newVersionRange(updtrConfig, oldVersionRange, update);

                dependenciesToSave = dependenciesToSave.filter(
                    ({name}) => name !== moduleName
                );
            });

            newPackageJson[type] = newDependencies;
        });

    if (dependenciesToSave.length > 0) {
        const dependencies = newPackageJson.dependencies || {};

        dependenciesToSave.forEach(update => {
            dependencies[update.name] = update.updateTo;
        });

        newPackageJson.dependencies = dependencies;
    }

    return newPackageJson;
}
