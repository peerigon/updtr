import updateVersionRange from "./updateVersionRange";
import { SAVE_CARET, SAVE_EXACT, SAVE_SMART } from "../../constants/config";

const dependencyTypes = [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
];

function newVersionRange(updtrConfig, oldVersionRange, update) {
    if (update === undefined) {
        return oldVersionRange;
    }

    switch (updtrConfig.save) {
        case SAVE_CARET:
            return "^" + update.version;
        case SAVE_EXACT:
            return update.version;
        case SAVE_SMART:
    }

    return updateVersionRange(oldVersionRange, update.version);
}

export default function createUpdatedPackageJson(
    oldPackageJson,
    updateResults,
    updtrConfig
) {
    const newPackageJson = { ...oldPackageJson };
    const successfulUpdates = updateResults.filter(
        updateResult => updateResult.success === true
    );
    const dependenciesToSave = successfulUpdates.slice();

    dependencyTypes
        .filter(type => oldPackageJson[type] !== undefined)
        .forEach(type => {
            const dependencies = oldPackageJson[type];
            const newDependencies = {};

            Object.keys(dependencies).forEach(moduleName => {
                const updateIndex = successfulUpdates.findIndex(
                    ({ name }) => name === moduleName
                );
                const update = successfulUpdates[updateIndex];
                const oldVersionRange = dependencies[moduleName];

                newDependencies[moduleName] = newVersionRange(
                    updtrConfig,
                    oldVersionRange,
                    update
                );

                dependenciesToSave.splice(updateIndex, 1);
            });

            newPackageJson[type] = newDependencies;
        });

    if (dependenciesToSave.length > 0) {
        const dependencies = newPackageJson.dependencies || {};

        dependenciesToSave.forEach(update => {
            dependencies[update.name] = update.version;
        });

        newPackageJson.dependencies = dependencies;
    }

    return newPackageJson;
}
