"use strict";

const async = require("async");
const childProcess = require("child_process");
const filter = require("./filter");
const EventEmitter = require("./EventEmitter.js");
let fs = require("fs"); // eslint-disable-line prefer-const
const path = require("path");

const defaultTestCmdNpm = "npm test";
const defaultTestCmdYarn = "yarn test";

function run(config, done) {
    const emitter = new EventEmitter();

    function exec(cmd, cb) {
        childProcess.exec(cmd, { maxBuffer: Infinity, encoding: "utf8", cwd: config.cwd }, cb);
    }

    function finish(err) {
        emitter.removeAllListeners();
        done(err || null);
    }

    if (typeof config.cwd !== "string") {
        throw new Error("Cannot run updtr: cwd missing");
    }

    sanitizeConfig(config);

    if (config.registry && config.useYarn) {
        throw new Error("`yarn add` does not support custom registries yet. Please use a .npmrc file to achieve this.");
    }

    const reporter = config.reporter;
    const testCmd = config.testCmd;

    reporter(emitter);

    emitter.emit("init", {
        cwd: config.cwd,
    });
    exec(config.useYarn ? "yarn outdated --json --flat" : "npm outdated --json --long --depth=0", (err, stdout) => {
        let infos;

        function createTask(info, index) {
            return function (done) {
                const event = {
                    current: index + 1, // index is zero-based
                    total: tasks.length,
                    info,
                    testCmd,
                    installCmd: (config.useYarn ? "yarn add" : "npm i") + (config.registry ? (" --registry " + config.registry) : ""),
                };
                let testStdout;

                if (!config.useYarn && config.saveExact) {
                    event.installCmd += " --save-exact";
                }

                const installCmd = event.installCmd + " " + info.name + "@" + info.updateTo + " " + info.saveCmd;

                emitter.emit("updating", event);

                async.series({
                    deleteOldVersion: async.apply(exec, (config.useYarn ? "yarn remove " : "npm remove ") + info.name + " " + info.saveCmd),
                    installNewVersion: async.apply(exec, installCmd),
                    emitTestingEvent(done) {
                        emitter.emit("testing", event);
                        setImmediate(done);
                    },
                    runTests: function runTests(callback) {
                        exec(testCmd, (err, stdout, stderr) => {
                            if (err) {
                                testStdout = stdout;
                                callback(err);

                                return;
                            }
                            callback(null, stdout, stderr);
                        });
                    },
                }, (err) => {
                    if (err) {
                        emitter.emit("rollback", event);
                        exec(event.installCmd + " " + info.name + "@" + info.current + " " + info.saveCmd + (config.saveExact ? " --save-exact" : ""), (err) => {
                            if (err) {
                                finish(err);

                                return;
                            }
                            emitter.emit("rollbackDone", event);
                            if (config.testStdout) {
                                event.testStdout = testStdout;
                                emitter.emit("testStdout", event);
                            }
                            done();
                        });

                        return;
                    }
                    emitter.emit("updatingDone", event);
                    done();
                });
            };
        }

        if (err && err.code > 1) {
            finish(err);

            return;
        }

        if (!stdout) {
            emitter.emit("noop");
            finish();

            return;
        }

        const outdated = JSON.parse(stdout);

        if (config.useYarn) {
            if ("data" in outdated && outdated.data.body instanceof Array) {
                infos = outdated.data.body.map((info) => ({
                    name: info[0],
                    current: info[1],
                    saveCmd: info[4] === "devDependencies" ? "--dev" : "",
                    type: info[4],
                    wanted: info[2],
                    latest: info[3],
                    updateTo: config.wanted ? info[2] : info[3],
                }));
            } else {
                infos = [];
            }
        } else {
            infos = Object.keys(outdated)
                .map((moduleName) => {
                    const info = outdated[moduleName];

                    info.name = moduleName;
                    info.saveCmd = info.type === "devDependencies" ? "--save-dev" : "--save";
                    info.updateTo = config.wanted ? info.wanted : info.latest;

                    return info;
                });
        }

        infos = infos.filter(filter(config));

        const missing = modulesMissing(infos);

        if (missing.length > 0) {
            emitter.emit("modulesMissing", {
                infos: missing,
            });
            finish();

            return;
        }

        if (infos.length === 0) {
            emitter.emit("noop");
            finish();

            return;
        }

        emitter.emit("outdated", {
            infos,
            total: infos.length,
        });

        const tasks = infos
            .map(createTask);

        async.series(tasks, (err) => {
            if (err) {
                finish(err);

                return;
            }
            emitter.emit("finished");
            finish();
        });
    });
}

function modulesMissing(infos) {
    return infos.filter((info) => !info.current);
}

function sanitizeConfig(config) {
    config.useYarn = fs.existsSync(path.resolve(config.cwd, "yarn.lock"));
    config.reporter = config.reporter || Function.prototype;
    config.testCmd = config.testCmd || (config.useYarn ? defaultTestCmdYarn : defaultTestCmdNpm);
    config.exclude = (config.exclude && config.exclude.split(",").map((name) => name.trim())) || [];
}

module.exports = run;
