import createUpdatedPackageJson from "./util/createUpdatedPackageJson";
import Sequence from "./util/Sequence";

function stringifyLikeNpm(packageJson) {
    return JSON.stringify(packageJson, null, "  ");
}

export default (async function updatePackageJson(updtr, updateResults) {
    const sequence = new Sequence("update-package-json", updtr);
    let oldPackageJson;

    sequence.start();

    try {
        oldPackageJson = JSON.parse(await updtr.readFile("package.json"));
    } catch (err) {
        err.message = "Error while trying to read the package.json: " +
            err.message;
        throw err;
    }

    const newPackageJson = createUpdatedPackageJson(
        oldPackageJson,
        updateResults
    );

    await updtr.writeFile("package.json", stringifyLikeNpm(newPackageJson));

    sequence.end({
        packageJson: newPackageJson,
    });
});
