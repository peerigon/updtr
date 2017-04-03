"use strict";

const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");
const os = require("os");
const childProcess = require("child_process");
const cmds = require("./exec/cmds");
const parse = require("./exec/parse");

function createInstance(config) {
    const cwd = config.cwd;
    const exclude = typeof config.exclude === "string" ?
        config.exclude.split(",") :
        config.exclude;
    const registry = config.registry;
    const emitter = new EventEmitter();

    if (typeof cwd !== "string") {
        throw new Error("Cannot run updtr: cwd is missing");
    }

    const packageManager = fs.existsSync(path.resolve(cwd, "yarn.lock")) ?
        "yarn" :
        "npm";

    if (registry && packageManager === "yarn") {
        throw new Error(
            "`yarn add` does not support custom registries yet. Please use a .npmrc file to achieve this."
        );
    }

    if (config.reporter) {
        config.reporter(emitter);
    }

    return {
        config: {
            updateTo: config.wanted ? "wanted" : "latest",
            exclude: Array.isArray(exclude) ?
                config.exclude.map(name => name.trim()) :
                [],
            registry,
            packageManager,
        },
        cmds: cmds[packageManager],
        parse: parse[packageManager],
        emit(eventName, event) {
            try {
                emitter.emit(eventName, event);
            } catch (err) {
                // Reporter errors are not critical, let's just report them and go on
                console.trace(
                    [
                        "Reporter error",
                        "---------------------------------------------------------------------------------",
                        err.stack,
                        "---------------------------------------------------------------------------------",
                    ].join(os.EOL)
                );
            }
        },
        exec: cmd =>
            new Promise((resolve, reject) => {
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
            }),
        dispose() {
            emitter.removeAllListeners();
        },
    };
}

module.exports = createInstance;
