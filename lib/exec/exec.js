"use strict";

const childProcess = require("child_process");

function exec(cwd, cmd) {
    return new Promise((resolve, reject) => {
        childProcess.exec(
            cmd,
            { maxBuffer: Infinity, encoding: "utf8", cwd },
            (err, s, e) => {
                // stdout and stderr should always be strings, just to make this sure
                const stdout = s || "";
                const stderr = e || "";

                if (err) {
                    err.stdout = stdout;
                    err.stderr = stderr;
                    reject(err);

                    return;
                }

                resolve({ stdout, stderr });
            }
        );
    });
}

module.exports = exec;
