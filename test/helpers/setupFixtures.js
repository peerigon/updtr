"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const cmds = require("../../lib/exec/cmds");

const pathToFixtures = path.resolve(__dirname, "..", "fixtures");
// mutex network is required because yarn has concurrency issues
// https://github.com/yarnpkg/yarn/issues/683
// https://github.com/yarnpkg/website/issues/261
const createYarnLock = "yarn --mutex network";
const fixtureSetups = {
    empty() {
        const fixture = "empty";
        const pathToFixture = path.join(pathToFixtures, fixture);

        return runOrSkipIfExists(
            pathToFixture,
            () => exec("npm init -y", fixture)
                .then(() => exec(createYarnLock, fixture))
                .then(() => {
                    writeLog(fixture, "npm", "outdated");
                    writeLog(fixture, "yarn", "outdated");
                })
        );
    },
    "no-outdated"() {
        const fixture = "no-outdated";
        const pathToFixture = path.join(pathToFixtures, fixture);

        return runOrSkipIfExists(
            pathToFixture,
            () => exec("npm init -y", fixture)
                .then(() => exec("npm i updtr-test-module-1 updtr-test-module-2 --save", fixture))
                .then(() => exec(createYarnLock, fixture))
                .then(() => {
                    writeLog(fixture, "npm", "outdated");
                    writeLog(fixture, "yarn", "outdated");
                })
        );
    },
    "no-outdated-dev"() {
        const fixture = "no-outdated-dev";
        const pathToFixture = path.join(pathToFixtures, fixture);

        return runOrSkipIfExists(
            pathToFixture,
            () => exec("npm init -y", fixture)
                .then(() => exec("npm i updtr-test-module-1 updtr-test-module-2 --save-dev", fixture))
                .then(() => exec(createYarnLock, fixture))
                .then(() => {
                    writeLog(fixture, "npm", "outdated");
                    writeLog(fixture, "yarn", "outdated");
                })
        );
    },
    "outdated"() {
        const fixture = "outdated";
        const pathToFixture = path.join(pathToFixtures, fixture);

        return runOrSkipIfExists(
            pathToFixture,
            () => exec("npm init -y", fixture)
                // updtr-test-module-1's minor version is outdated (non-breaking),
                // updtr-test-module-2's major version is outdated (breaking)
                .then(() => exec("npm i updtr-test-module-1@1.0.0 updtr-test-module-2@1.0.0 --save", fixture))
                .then(() => exec(createYarnLock, fixture))
                .then(() => {
                    writeLog(fixture, "npm", "outdated");
                    writeLog(fixture, "yarn", "outdated");
                })
        );
    },
    "outdated-dev"() {
        const fixture = "outdated-dev";
        const pathToFixture = path.join(pathToFixtures, fixture);

        return runOrSkipIfExists(
            pathToFixture,
            () => exec("npm init -y", fixture)
                // updtr-test-module-1's minor version is outdated (non-breaking),
                // updtr-test-module-2's major version is outdated (breaking)
                .then(() => exec("npm i updtr-test-module-1@1.0.0 updtr-test-module-2@1.0.0 --save-dev", fixture))
                .then(() => exec(createYarnLock, fixture))
                .then(() => {
                    writeLog(fixture, "npm", "outdated");
                    writeLog(fixture, "yarn", "outdated");
                })
        );
    },
};

function runOrSkipIfExists(path, fn) {
    return new Promise((resolve, reject) => {
        fs.mkdir(path, err => {
            if (err) {
                if (err.code === "EEXIST") {
                    return void resolve();
                }
                throw err;
            }

            return void resolve(fn());
        });
    });
}

function exec(cmd, fixture) {
    return new Promise(resolve => {
        const cwd = path.join(pathToFixtures, fixture);

        console.log(cwd, cmd);

        childProcess.exec(
            cmd,
            { maxBuffer: Infinity, encoding: "utf8", cwd },
            (err, stdout, stderr) => {
                // If the outdated command was executed, err will be set because npm outdated exits
                // with a non-zero code when there are outdated dependencies
                if (err !== null && (err.code > 1 || / outdated/.test(cmd) === false)) {
                    // Immediately stop the process
                    throw err;
                }

                return void resolve(stdout);
            }
        );
    });
}

function writeLog(fixture, packageManager, cmd) {
    return exec(cmds[packageManager][cmd](), fixture)
        .then(stdout => {
            fs.writeFileSync(path.join(pathToFixtures, fixture, [cmd, packageManager, "log"].join(".")), stdout);
        });
}

function setupFixtures() {
    mkdirp.sync(pathToFixtures);
    Object.keys(fixtureSetups)
        .map(setup => fixtureSetups[setup])
        // Use reduce if there are concurrency issues
        // .reduce((promise, nextSetup) => promise.then(nextSetup), Promise.resolve());
        .forEach(setup => setup());
}

if (!module.parent) {
    setupFixtures();
}

module.exports = fixtureSetups;
