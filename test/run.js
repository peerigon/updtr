"use strict";

var assert = require("assert");
var run = require("../lib/run");
var childProcess = require("child_process");

var reporter;
var test;
var execBackup;
var expectedNoOutdatedModule = {};
var expectedOneOutdatedModule = {
    "unicons": {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "unicons",
        type: "dependencies"
    }
};

describe("run()", function () {
    it("should throw an error if no options set", function () {
        assert.throws(
            function () {
                run();
            },
            Error
        );
    });

    it("should throw an error if cwd is no string", function () {
        assert.throws(
            function () {
                run({
                    cwd: 1
                });
            },
            /Cannot run updtr: cwd missing/
        );
    });

    describe(".emit('init')", function () {
        before(function () {
            execBackup = childProcess.exec;
            // cmd, { encoding: "utf8", cwd: config.cwd }, cb
            test = function (cmd, obj, cb) {
                // err, stdout, stderr
                cb(null, JSON.stringify(expectedNoOutdatedModule), null);
            };
            childProcess.exec = test;
        });

        afterEach(function () {
            childProcess.exec = execBackup;
        });

        it("should be emitted", function (done) {
            reporter = function (emitter) {
                emitter.on("init", function (options) {
                    assert.deepEqual(options, {
                        cwd: "/Users/peerigon/Workspace/peerigon/updtr"
                    });
                });
            };

            run({
                cwd: process.cwd(),
                reporter: reporter
            }, done);
        });
    });

    describe(".emit('noop')", function () {
        before(function () {
            execBackup = childProcess.exec;
            // cmd, { encoding: "utf8", cwd: config.cwd }, cb
            test = function (cmd, obj, cb) {
                // err, stdout, stderr
                cb(null, JSON.stringify(expectedNoOutdatedModule), null);
            };
            childProcess.exec = test;
        });

        afterEach(function () {
            childProcess.exec = execBackup;
        });

        it("should be emitted if no outdated modules were found", function (done) {
            reporter = function (emitter) {
                emitter.on("noop", function (options) {
                    assert.equal(options, undefined);
                });
            };

            run({
                cwd: process.cwd(),
                reporter: reporter
            }, done);
        });
    });

    describe(".emit('outdated')", function () {
        beforeEach(function () {
            execBackup = childProcess.exec;
            // cmd, { encoding: "utf8", cwd: config.cwd }, cb
            test = function (cmd, obj, cb) {
                // err, stdout, stderr
                cb(null, JSON.stringify(expectedOneOutdatedModule), null);
            };
            childProcess.exec = test;
        });

        it("should be emitted if outdated modules were found", function (done) {
            reporter = function (emitter) {
                emitter.on("outdated", function (options) {
                    assert.deepEqual(options, {
                        infos: [{
                            current: "0.1.4",
                            wanted: "1.1.5",
                            latest: "2.0.0",
                            location: "unicons",
                            type: "dependencies",
                            name: "unicons",
                            saveCmd: "--save"
                        }],
                        total: 1
                    });
                });
            };

            run({
                cwd: process.cwd(),
                reporter: reporter
            }, done);
        });
    });

    describe(".emit('updating')", function () {
        beforeEach(function () {
            execBackup = childProcess.exec;
            // cmd, { encoding: "utf8", cwd: config.cwd }, cb
            test = function (cmd, obj, cb) {
                // err, stdout, stderr
                cb(null, JSON.stringify(expectedOneOutdatedModule), null);
            };
            childProcess.exec = test;
        });

        it("should be emitted if outdated modules were found", function (done) {
            reporter = function (emitter) {
                emitter.on("updating", function (options) {
                    assert.deepEqual(options, {
                        current: 1,
                        total: 1,
                        info: {
                            current: "0.1.4",
                            wanted: "1.1.5",
                            latest: "2.0.0",
                            location: "unicons",
                            type: "dependencies",
                            name: "unicons",
                            saveCmd: "--save"
                        }
                    });
                });
            };

            run({
                cwd: process.cwd(),
                reporter: reporter
            }, done);
        });
    });

    describe(".emit('testing')", function () {
        beforeEach(function () {
            execBackup = childProcess.exec;
            // cmd, { encoding: "utf8", cwd: config.cwd }, cb
            test = function (cmd, obj, cb) {
                // err, stdout, stderr
                cb(null, JSON.stringify(expectedOneOutdatedModule), null);
            };
            childProcess.exec = test;
        });

        it("should be emitted if outdated modules were found", function (done) {
            reporter = function (emitter) {
                emitter.on("testing", function (options) {
                    assert.deepEqual(options, {
                        current: 1,
                        total: 1,
                        info: {
                            current: "0.1.4",
                            wanted: "1.1.5",
                            latest: "2.0.0",
                            location: "unicons",
                            type: "dependencies",
                            name: "unicons",
                            saveCmd: "--save"
                        }
                    });
                });
            };

            run({
                cwd: process.cwd(),
                reporter: reporter
            }, done);
        });
    });

    describe(".emit('rollback')", function () {
        beforeEach(function () {
            execBackup = childProcess.exec;
            // cmd, { encoding: "utf8", cwd: config.cwd }, cb
            test = function (cmd, obj, cb) {
                // err, stdout, stderr
                if (cmd === "npm outdated --json --long --depth=0") {
                    cb(null, JSON.stringify(expectedOneOutdatedModule), null);
                } else if (cmd === "npm test") {
                    cb(new Error);
                } else {
                    cb(null);
                }
            };
            childProcess.exec = test;
        });

        it("should be emitted if outdated modules were found", function (done) {
            reporter = function (emitter) {
                emitter.on("rollback", function (options) {
                    assert.deepEqual(options, {
                        current: 1,
                        total: 1,
                        info: {
                            current: "0.1.4",
                            wanted: "1.1.5",
                            latest: "2.0.0",
                            location: "unicons",
                            type: "dependencies",
                            name: "unicons",
                            saveCmd: "--save"
                        }
                    });
                });
            };

            run({
                cwd: process.cwd(),
                reporter: reporter
            }, done);
        });
    });

    describe(".emit('rollbackDone')", function () {
        beforeEach(function () {
            execBackup = childProcess.exec;
            // cmd, { encoding: "utf8", cwd: config.cwd }, cb
            test = function (cmd, obj, cb) {
                // err, stdout, stderr
                if (cmd === "npm outdated --json --long --depth=0") {
                    cb(null, JSON.stringify(expectedOneOutdatedModule), null);
                } else if (cmd === "npm test") {
                    cb(new Error);
                } else {
                    cb(null);
                }
            };
            childProcess.exec = test;
        });

        it("should be emitted if outdated modules were found", function (done) {
            reporter = function (emitter) {
                emitter.on("rollbackDone", function (options) {
                    assert.deepEqual(options, {
                        current: 1,
                        total: 1,
                        info: {
                            current: "0.1.4",
                            wanted: "1.1.5",
                            latest: "2.0.0",
                            location: "unicons",
                            type: "dependencies",
                            name: "unicons",
                            saveCmd: "--save"
                        }
                    });
                });
            };

            run({
                cwd: process.cwd(),
                reporter: reporter
            }, done);
        });
    });

    describe(".emit('updatingDone')", function () {
        beforeEach(function () {
            execBackup = childProcess.exec;
            // cmd, { encoding: "utf8", cwd: config.cwd }, cb
            test = function (cmd, obj, cb) {
                // err, stdout, stderr
                cb(null, JSON.stringify(expectedOneOutdatedModule), null);
            };
            childProcess.exec = test;
        });

        it("should be emitted if outdated modules were found", function (done) {
            reporter = function (emitter) {
                emitter.on("updatingDone", function (options) {
                    assert.deepEqual(options, {
                        current: 1,
                        total: 1,
                        info: {
                            current: "0.1.4",
                            wanted: "1.1.5",
                            latest: "2.0.0",
                            location: "unicons",
                            type: "dependencies",
                            name: "unicons",
                            saveCmd: "--save"
                        }
                    });
                });
            };

            run({
                cwd: process.cwd(),
                reporter: reporter
            }, done);
        });
    });

    describe(".emit('finished')", function () {
        beforeEach(function () {
            execBackup = childProcess.exec;
            // cmd, { encoding: "utf8", cwd: config.cwd }, cb
            test = function (cmd, obj, cb) {
                // err, stdout, stderr
                cb(null, JSON.stringify(expectedOneOutdatedModule), null);
            };
            childProcess.exec = test;
        });

        it("should be emitted if outdated modules were found", function (done) {
            reporter = function (emitter) {
                emitter.on("finished", function (options) {
                    assert.deepEqual(options, undefined);
                });
            };

            run({
                cwd: process.cwd(),
                reporter: reporter
            }, done);
        });
    });
});
