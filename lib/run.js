"use strict";

var async = require("async");
var childProcess = require("child_process");

var EventEmitter = require("./EventEmitter.js");

var testCmd = "npm test";

function run(config, done) {
    var emitter = new EventEmitter();
    var reporter = config.reporter || Function.prototype;
    var cwd = config.cwd;

    function exec(cmd, cb) {
        childProcess.exec(cmd, { encoding: "utf8", cwd: config.cwd }, cb);
    }

    function finish(err) {
        emitter.removeAllListeners();
        done(err || null);
    }

    if (typeof cwd !== "string") {
        throw new Error("Cannot run updtr: cwd missing");
    }

    testCmd = config.testCmd ? config.testCmd : testCmd;

    reporter(emitter);

    emitter.emit("init", {
        cwd: config.cwd
    });
    exec("npm outdated --json --long --depth=0", function (err, stdout, stderr) {
        var outdated;
        var infos;
        var tasks;
        var modulesMissing;

        function createTask(info, index) {
            index++;

            return function (done) {
                var event = {
                    current: index,
                    total: tasks.length,
                    info: info,
                    testCmd: testCmd
                };
                var testStdout;
                var installCmd = "npm i " + info.name + "@" + info.updateTo + " " + info.saveCmd;

                if (config.saveExact) {
                    installCmd += " --save-exact";
                }

                emitter.emit("updating", event);

                async.series({
                    deleteOldVersion: async.apply(exec, "npm remove " + info.name + " " + info.saveCmd),
                    installNewVersion: async.apply(exec, installCmd),
                    emitTestingEvent: function (done) {
                        emitter.emit("testing", event);
                        setImmediate(done);
                    },
                    runTests: function runTests(callback) {
                        exec(testCmd, function (err, stdout, stderr) {
                            if (err) {
                                testStdout = stdout;
                                return callback(err);
                            }
                            callback(null, stdout, stderr);
                        });
                    }
                }, function (err) {
                    if (err) {
                        emitter.emit("rollback", event);
                        exec("npm i " + info.name + "@" + info.current + " " + info.saveCmd + (config.saveExact ? " --save-exact" : ""), function (err) {
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

        if (err) {
            finish(err);
            return;
        }

        if (!stdout) {
            emitter.emit("noop");
            finish();
            return;
        }

        outdated = JSON.parse(stdout);
        infos = Object.keys(outdated)
            .map(function (moduleName) {
                var info = outdated[moduleName];

                info.name = moduleName;
                info.saveCmd = info.type === "devDependencies" ? "--save-dev" : "--save";
                info.updateTo = config.wanted ? info.wanted : info.latest;

                return info;
            })
            .filter(function (info) {
                var isGitDependeny = info.latest === "git";
                var alreadyInstalled = info.updateTo === info.current;
                var isUnstable = false;
                var excludedModules;
                var isExcluded = false;

                if (config.exclude) {
                    excludedModules = config.exclude.split(",").map(function (name) {
                        return name.trim();
                    });
                    isExcluded = info.name.match(new RegExp("(" + excludedModules.join("|") + ")"), "g");
                }

                // Check for hyphen in version string as this is a prerelease version according to SemVer
                if (info.updateTo && info.updateTo.indexOf("-") !== -1) {
                    isUnstable = true;
                }

                return !(isGitDependeny || alreadyInstalled || isUnstable || isExcluded);
            });

        modulesMissing = infos.some(function (info) {
            return !info.current;
        });

        if (modulesMissing) {
            emitter.emit("modulesMissing");
            finish();
            return;
        }

        if (infos.length === 0) {
            emitter.emit("noop");
            finish();
            return;
        }

        emitter.emit("outdated", {
            infos: infos,
            total: infos.length
        });

        tasks = infos
            .map(function (info, index, outdatedModules) {
                return createTask(info, index, outdatedModules);
            });

        async.series(tasks, function (err) {
            if (err) {
                finish(err);
                return;
            }
            emitter.emit("finished");
            finish();
        });
    });
}

module.exports = run;
