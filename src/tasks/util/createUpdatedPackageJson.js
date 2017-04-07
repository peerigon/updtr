import updateVersionRange from "./updateVersionRange";

const dependencyTypes = [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
];

export default function createUpdatedPackageJson(
    oldPackageJson,
    updateResults
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

                newDependencies[moduleName] = update === undefined ?
                    oldVersionRange :
                    updateVersionRange(oldVersionRange, update.version);

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
