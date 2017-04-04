import fs from "fs";
import path from "path";
import pify from "pify";
import cmds from "../../src/exec/cmds";
import exec from "../../src/exec/exec";

const mkdir = pify(fs.mkdir);
const writeFile = pify(fs.writeFile);
const pathToFixtures = path.resolve(__dirname, "..", "fixtures");
// mutex network is required because yarn has concurrency issues
// https://github.com/yarnpkg/yarn/issues/683
// https://github.com/yarnpkg/website/issues/261
const createYarnLock = "yarn --mutex network";
const fixtureSetups = {
    async empty() {
        const fixture = "empty";
        const pathToFixture = path.join(pathToFixtures, fixture);

        await runOrSkipIfExists(pathToFixture, async () => {
            await execCmd("npm init -y", fixture);
            await execCmd(createYarnLock, fixture);
            await Promise.all([
                writeStdoutLog(fixture, "npm", "outdated"),
                writeStdoutLog(fixture, "yarn", "outdated"),
            ]);
        });
    },
    async "no-outdated"() {
        const fixture = "no-outdated";
        const pathToFixture = path.join(pathToFixtures, fixture);

        await runOrSkipIfExists(pathToFixture, async () => {
            await execCmd("npm init -y", fixture);
            await execCmd(
                "npm i updtr-test-module-1 updtr-test-module-2 --save",
                fixture
            );
            await execCmd(createYarnLock, fixture);
            await Promise.all([
                writeStdoutLog(fixture, "npm", "outdated"),
                writeStdoutLog(fixture, "yarn", "outdated"),
            ]);
        });
    },
    async "no-outdated-dev"() {
        const fixture = "no-outdated-dev";
        const pathToFixture = path.join(pathToFixtures, fixture);

        await runOrSkipIfExists(pathToFixture, async () => {
            await execCmd("npm init -y", fixture);
            await execCmd(
                "npm i updtr-test-module-1 updtr-test-module-2 --save-dev",
                fixture
            );
            await execCmd(createYarnLock, fixture);
            await Promise.all([
                writeStdoutLog(fixture, "npm", "outdated"),
                writeStdoutLog(fixture, "yarn", "outdated"),
            ]);
        });
    },
    async outdated() {
        const fixture = "outdated";
        const pathToFixture = path.join(pathToFixtures, fixture);

        await runOrSkipIfExists(pathToFixture, async () => {
            await execCmd("npm init -y", fixture);
            await execCmd(
                // updtr-test-module-1's minor version is outdated (non-breaking),
                // updtr-test-module-2's major version is outdated (breaking)
                "npm i updtr-test-module-1@1.0.0 updtr-test-module-2@1.0.0 --save",
                fixture
            );
            await execCmd(createYarnLock, fixture);
            await Promise.all([
                writeStdoutLog(fixture, "npm", "outdated"),
                writeStdoutLog(fixture, "yarn", "outdated"),
            ]);
        });
    },
    async "outdated-dev"() {
        const fixture = "outdated-dev";
        const pathToFixture = path.join(pathToFixtures, fixture);

        await runOrSkipIfExists(pathToFixture, async () => {
            await execCmd("npm init -y", fixture);
            await execCmd(
                // updtr-test-module-1's minor version is outdated (non-breaking),
                // updtr-test-module-2's major version is outdated (breaking)
                "npm i updtr-test-module-1@1.0.0 updtr-test-module-2@1.0.0 --save-dev",
                fixture
            );
            await execCmd(createYarnLock, fixture);
            await Promise.all([
                writeStdoutLog(fixture, "npm", "outdated"),
                writeStdoutLog(fixture, "yarn", "outdated"),
            ]);
        });
    },
};

// Returns true if it actually created a directory
// Returns false if the directory was already there
async function gracefulMkdir(path) {
    try {
        await mkdir(path);

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

async function execCmd(cmd, fixture) {
    const cwd = path.join(pathToFixtures, fixture);

    console.log(cwd, cmd);

    try {
        return (await exec(cwd, cmd)).stdout;
    } catch (err) {
        // If the outdated command was executed, err will be set because npm outdated exits
        // with a non-zero code when there are outdated dependencies
        if (err.code === 1 && / outdated/.test(cmd) === true) {
            return err.stdout;
        }
        throw err;
    }
}

async function writeStdoutLog(fixture, packageManager, cmd) {
    const stdout = await execCmd(cmds[packageManager][cmd](), fixture);
    const filename = path.join(
        pathToFixtures,
        fixture,
        [cmd, packageManager, "log"].join(".")
    );

    await writeFile(filename, stdout);
}

async function setupFixtures() {
    await gracefulMkdir(pathToFixtures);

    return Promise.all(
        Object.keys(fixtureSetups).map(setup => fixtureSetups[setup]())
    );
}

if (!module.parent) {
    setupFixtures().catch(err => {
        setImmediate(() => {
            throw err;
        });
    });
}

module.exports = fixtureSetups;
