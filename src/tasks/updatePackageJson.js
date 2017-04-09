import createUpdatedPackageJson from "./util/createUpdatedPackageJson";
import Sequence from "./util/Sequence";

function stringifyLikeNpm(packageJson) {
    return JSON.stringify(packageJson, null, "  ");
}

async function enhanceErrorMessage(fn, enhancedMessage) {
    try {
        return await fn();
    } catch (err) {
        err.message = enhancedMessage + err.message;
        throw err;
    }
}

export default (async function updatePackageJson(updtr, updateResults) {
    const sequence = new Sequence("update-package-json", updtr);

    sequence.start();

    const oldPackageJson = await enhanceErrorMessage(
        async () => JSON.parse(await updtr.readFile("package.json")),
        "Error while trying to read the package.json: "
    );

    const newPackageJson = createUpdatedPackageJson(
        oldPackageJson,
        updateResults
    );

    await enhanceErrorMessage(
        () => updtr.writeFile("package.json", stringifyLikeNpm(newPackageJson)),
        "Error while trying to write the package.json: "
    );

    sequence.end({
        packageJson: newPackageJson,
    });
});
