"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const cmds = require("../../lib/exec/cmds");

const pathToFixtures = path.resolve(__dirname, "..", "fixtures");
const fixtures = [
    "empty",
    "no-outdated",
    "outdated",
    "outdated-dev",
];

function exec(packageManager, fixture, cmd, cmdArgs) {
    return new Promise(resolve => {
        const cwd = path.join(pathToFixtures, fixture);

        childProcess.exec(
            cmds[packageManager][cmd](cmdArgs),
            { maxBuffer: Infinity, encoding: "utf8", cwd },
            (err, stdout, stderr) => { // eslint-disable-line handle-callback-err
                // err will be set because npm outdated exits with a non-zero code when there are outdated dependencies
                resolve(stdout);
            }
        );
    });
}

function writeLog(packageManager, fixture, cmd) {
    return exec(packageManager, fixture, cmd)
        .then(stdout => {
            fs.writeFileSync(path.join(pathToFixtures, fixture, [cmd, packageManager, "log"].join(".")), stdout);
        });
}

function setupFixtures() {
    fixtures.forEach(fixture => exec("yarn", fixture, "installMissing")
        .then(() => {
            if (/^outdated/.test(fixture)) {
                return exec("npm", fixture, "install", { name: "batch-replace", version: "1.0.0" });
            }

            return Promise.resolve("");
        })
        .then(() => {
            writeLog("npm", fixture, "outdated");
            writeLog("yarn", fixture, "outdated");
        })
    );
}

if (!module.parent) {
    setupFixtures();
}

module.exports = setupFixtures;
