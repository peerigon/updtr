import createUpdatedPackageJson from "./util/createUpdatedPackageJson";
import Sequence from "./util/Sequence";

function lastChar(str) {
    return str.charAt(str.length - 1);
}

function stringify(newPackageJson, oldPackageJsonStr) {
    let newPackageJsonStr = JSON.stringify(newPackageJson, null, "  ");
    const lastCharFromOldPackageJson = lastChar(oldPackageJsonStr);

    // Preserve the new line character at the end if there was one
    if (lastCharFromOldPackageJson !== lastChar(newPackageJsonStr)) {
        newPackageJsonStr += lastCharFromOldPackageJson;
    }

    return newPackageJsonStr;
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
    let oldPackageJsonStr;

    sequence.start();

    const oldPackageJson = await enhanceErrorMessage(
        async () => {
            oldPackageJsonStr = await updtr.readFile("package.json");

            return JSON.parse(oldPackageJsonStr);
        },
        "Error while trying to read the package.json: "
    );

    const newPackageJson = createUpdatedPackageJson(
        oldPackageJson,
        updateResults,
        updtr.config
    );

    await enhanceErrorMessage(
        () =>
            updtr.writeFile(
                "package.json",
                stringify(newPackageJson, oldPackageJsonStr)
            ),
        "Error while trying to write the package.json: "
    );

    sequence.end({
        packageJson: newPackageJson,
    });
});
