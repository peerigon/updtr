import path from "path";
import cmds from "../../src/exec/cmds";
import exec from "../../src/exec/exec";
import fs from "../../src/util/fs";

const pathToFixtures = path.resolve(__dirname, "..", "fixtures");

export const fixtureSetups = {
    async empty() {
        const fixture = "empty";
        const pathToFixture = path.join(pathToFixtures, fixture);

        await runOrSkipIfExists(pathToFixture, async () => {
            await execFixtureCmd(fixture, "npm init -y");
            await writeStdoutLog(fixture, "npm", "outdated");
            await writeStdoutLog(fixture, "npm", "list");
            await execFixtureCmd(fixture, yarn()); // create lock file
            await writeStdoutLog(fixture, "yarn", "outdated");
            await writeStdoutLog(fixture, "yarn", "list");
            await modifyPackageJson(fixture, testOkModifier);
        });
    },
    async "no-outdated"() {
        const fixture = "no-outdated";
        const pathToFixture = path.join(pathToFixtures, fixture);

        await runOrSkipIfExists(pathToFixture, async () => {
            await execFixtureCmd(fixture, "npm init -y");
            await execFixtureCmd(
                fixture,
                "npm i updtr-test-module-1 updtr-test-module-2 --save"
            );
            await writeStdoutLog(fixture, "npm", "outdated");
            await writeStdoutLog(fixture, "npm", "list");
            await execFixtureCmd(fixture, yarn()); // create lock file
            await execFixtureCmd(
                fixture,
                yarn(
                    "add",
                    "updtr-test-module-1 updtr-test-module-2 --save"
                )
            );
            await writeStdoutLog(fixture, "yarn", "outdated");
            await modifyPackageJson(
                fixture,
                testOkModifier,
                caretRangeModifier
            );
            await writeStdoutLog(fixture, "yarn", "list");
        });
    },
    async "no-outdated-dev"() {
        const fixture = "no-outdated-dev";
        const pathToFixture = path.join(pathToFixtures, fixture);

        await runOrSkipIfExists(pathToFixture, async () => {
            await execFixtureCmd(fixture, "npm init -y");
            await execFixtureCmd(
                fixture,
                "npm i updtr-test-module-1 updtr-test-module-2 --save-dev"
            );
            await writeStdoutLog(fixture, "npm", "outdated");
            await writeStdoutLog(fixture, "npm", "list");
            await execFixtureCmd(fixture, yarn()); // create lock file
            await execFixtureCmd(
                fixture,
                yarn(
                    "add",
                    "updtr-test-module-1 updtr-test-module-2 --save"
                )
            );
            await writeStdoutLog(fixture, "yarn", "outdated");
            await modifyPackageJson(
                fixture,
                testOkModifier,
                caretRangeModifier
            );
            await writeStdoutLog(fixture, "yarn", "list");
        });
    },
    async outdated() {
        const fixture = "outdated";
        const pathToFixture = path.join(pathToFixtures, fixture);

        await runOrSkipIfExists(pathToFixture, async () => {
            await execFixtureCmd(fixture, "npm init -y");
            await execFixtureCmd(
                fixture,
                'npm i "updtr-test-module-1@1.0.0" "updtr-test-module-2@2.0.0" --save'
            );
            await writeStdoutLog(fixture, "npm", "outdated");
            await writeStdoutLog(fixture, "npm", "list");
            await execFixtureCmd(fixture, yarn()); // create lock file
            await execFixtureCmd(
                fixture,
                yarn(
                    "add",
                    '"updtr-test-module-1@1.0.0" "updtr-test-module-2@2.0.0" --save'
                )
            );
            await writeStdoutLog(fixture, "yarn", "outdated");
            await modifyPackageJson(
                fixture,
                testOkModifier,
                caretRangeModifier
            );
            await writeStdoutLog(fixture, "yarn", "list");
        });
    },
    async "outdated-dev"() {
        const fixture = "outdated-dev";
        const pathToFixture = path.join(pathToFixtures, fixture);

        await runOrSkipIfExists(pathToFixture, async () => {
            await execFixtureCmd(fixture, "npm init -y");
            await execFixtureCmd(
                fixture,
                'npm i "updtr-test-module-1@1.0.0" "updtr-test-module-2@2.0.0" --save'
            );
            await writeStdoutLog(fixture, "npm", "outdated");
            await writeStdoutLog(fixture, "npm", "list");
            await execFixtureCmd(fixture, yarn()); // create lock file
            await execFixtureCmd(
                fixture,
                yarn(
                    "add",
                    '"updtr-test-module-1@1.0.0" "updtr-test-module-2@2.0.0" --save'
                )
            );
            await writeStdoutLog(fixture, "yarn", "outdated");
            await modifyPackageJson(
                fixture,
                testOkModifier,
                caretRangeModifier
            );
            await writeStdoutLog(fixture, "yarn", "list");
        });
    },
};

function yarn(cmd = "", appendix = "") {
    // mutex network is required because yarn has concurrency issues
    // https://github.com/yarnpkg/yarn/issues/683
    // https://github.com/yarnpkg/website/issues/261
    return `yarn ${cmd} --mutex network ${appendix}`;
}

function caretRangeModifier(packageJson) {
    return packageJson.replace(/("updtr-test-module-\d+": ")(\d+)/g, "$1^$2");
}

function testOkModifier(packageJson) {
    return packageJson.replace(/echo .*? && exit 1/, "exit 0");
}

function applyModifier(str, modifier) {
    return modifier(str);
}

async function modifyPackageJson(fixture, ...modifiers) {
    const pathToPackageJson = path.join(
        pathToFixtures,
        fixture,
        "package.json"
    );

    const packageJson = await fs.readFile(pathToPackageJson, "utf8");

    await fs.writeFile(
        pathToPackageJson,
        modifiers.reduce(applyModifier, packageJson)
    );
}

// Returns true if it actually created a directory
// Returns false if the directory was already there
async function gracefulMkdir(path) {
    try {
        await fs.mkdir(path);

        return true;
    } catch (err) {
        if (err.code === "EEXIST") {
            return false;
        }
        throw err;
    }
}

async function runOrSkipIfExists(path, fn) {
    if (await gracefulMkdir(path)) {
        await fn();
    }
}

async function execFixtureCmd(fixture, cmd) {
    const cwd = path.join(pathToFixtures, fixture);

    console.log(cwd, cmd);

    try {
        return (await exec(cwd, cmd)).stdout;
    } catch (error) {
        // If the outdated command was executed, err will be set because npm outdated exits
        // with a non-zero code when there are outdated dependencies
        if (error.code === 1 && / outdated/.test(cmd) === true) {
            return error.stdout;
        }
        error.message = `Error in ${cwd}: ${error.message}`;
        throw error;
    }
}

async function writeStdoutLog(fixture, packageManager, cmd) {
    const stdout = await execFixtureCmd(fixture, cmds[packageManager][cmd]());

    const filename = path.join(
        pathToFixtures,
        fixture,
        [cmd, packageManager, "log"].join(".")
    );

    await fs.writeFile(filename, stdout);
}

async function setupAllFixtures() {
    await gracefulMkdir(pathToFixtures);

    for (const setup of Object.keys(fixtureSetups)) {
        // Executing fixture setup sequentially because running multiple package managers
        // at the same time comes with its own set of problems
        await fixtureSetups[setup](); // eslint-disable-line no-await-in-loop
    }
}

if (!module.parent) {
    process.on("unhandledRejection", error => {
        console.error(error.stack);
        process.exit(1); // eslint-disable-line no-process-exit
    });

    setupAllFixtures();
}

export default setupAllFixtures;
