function createUpdatedDependencyMap(oldDependencyMap, successfulUpdateResults) {
    return successfulUpdateResults.reduce(
        (newDependencyMap, updateResult) => {},
        { ...oldDependencyMap }
    );
}

export default function createUpdatedPackageJson(
    oldPackageJson,
    updateResults
) {
    const successfulUpdateResults = updateResults.filter(
        updateResult => updateResult.success === true
    );

    return SUPPORTED.reduce(
        (newPackageJson, type) => {
            newPackageJson[type];
        },
        { ...oldPackageJson }
    );
    SUPPORTED.forEach();
    const oldDependencies = oldPackageJson.dependencies;
    const oldDevDependencies = oldPackageJson.devDependencies;
    const oldOptionalDependencies = oldPackageJson.optionalDependencies;

    // return
    //     .reduce(({ type }) => [type, name, version], { ...oldPackageJson });
}
