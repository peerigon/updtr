"use strict";

var childProcess = require("child_process");
var chai = require("chai");
var run = require("../lib/run");

var expect = chai.expect;

var reporter;
var execBackup;
var noOutdatedModules = {};
var outdatedModules = {
    unicons: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "unicons",
        type: "dependencies"
    }
};
var outdatedModulesWithGitDependencies = {
    unicons: outdatedModules.unicons,
    "xunit-file": {
        current: "0.0.7",
        wanted: "git",
        latest: "git",
        location: "xunit-file",
        type: "dependencies"
    },
    "servus.js": {
        current: "0.0.1",
        wanted: "git",
        latest: "git",
        location: "servus.js",
        type: "dependencies"
    }
};

var expectedOptions = {
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
};

var expectedOptionsWithCurrentCount = {
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
};

function tearDown() {
    childProcess.exec = execBackup;
}

function execMock(object) {
    return function (cmd, obj, cb) {
        if (cmd === "npm outdated --json --long --depth=0") {
            setImmediate(cb, null, JSON.stringify(object), null);
        } else if (cmd === "npm test") {
            setImmediate(cb, new Error());
        } else {
            setImmediate(cb, null);
        }
    };
}

function setupOutdatedModules(obj) {
    return function () {
        execBackup = childProcess.exec;
        childProcess.exec = execMock(obj);
    };
}

describe("run()", function () {
    describe(".emit('init')", function () {
        before(setupOutdatedModules(outdatedModules));

        after(tearDown);

        it("should throw an error, if no options set", function () {
            expect(run).to.throw(Error);
        });

        it("should throw an error, if cwd is missing", function () {
            expect(
                function () {
                    run({ cwd: 1 });
                }
            ).to.throw(Error);
        });

        it("should be emitted, if cwd is set", function (done) {
            reporter = function (emitter) {
                emitter.on("init", function (options) {
                    expect(options).to.eql({ cwd: "/Users/peerigon/Workspace/peerigon/updtr" });
                });
            };

            run({ cwd: process.cwd(), reporter: reporter }, done);
        });
    });

    describe(".emit('noop')", function () {
        before(setupOutdatedModules(noOutdatedModules));

        afterEach(tearDown);

        it("should be emitted if no outdated modules were found", function (done) {
            reporter = function (emitter) {
                emitter.on("noop", function (options) {
                    expect(options).to.be.undefined; // eslint-disable-line
                });
            };

            run({ cwd: process.cwd(), reporter: reporter }, done);
        });
    });

    describe(".emit('outdated')", function () {
        describe("without git modules", function () {
            before(setupOutdatedModules(outdatedModules));

            afterEach(tearDown);

            it("should be emitted if outdated modules were found", function (done) {
                reporter = function (emitter) {
                    emitter.on("outdated", function (options) {
                        expect(options).to.eql(expectedOptions);
                    });
                };

                run({ cwd: process.cwd(), reporter: reporter }, done);
            });
        });

        describe("whit git modules", function () {
            before(setupOutdatedModules(outdatedModulesWithGitDependencies));

            afterEach(tearDown);

            it("should be emitted without git modules", function (done) {
                reporter = function (emitter) {
                    emitter.on("outdated", function (options) {
                        expect(options).to.eql(expectedOptions);
                    });
                };

                run({ cwd: process.cwd(), reporter: reporter }, done);
            });
        });
    });

    describe(".emit('updating')", function () {
        before(setupOutdatedModules(outdatedModules));
        afterEach(tearDown);

        it("should be emitted if outdated modules were found", function (done) {
            reporter = function (emitter) {
                emitter.on("updating", function (options) {
                    expect(options).to.eql(expectedOptionsWithCurrentCount);
                });
            };

            run({ cwd: process.cwd(), reporter: reporter }, done);
        });
    });

    describe(".emit('testing')", function () {
        before(setupOutdatedModules(outdatedModules));
        afterEach(tearDown);

        it("should be emitted if outdated modules were found", function (done) {
            reporter = function (emitter) {
                emitter.on("testing", function (options) {
                    expect(options).to.eql(expectedOptionsWithCurrentCount);
                });
            };

            run({ cwd: process.cwd(), reporter: reporter }, done);
        });
    });

    describe(".emit('rollback')", function () {
        before(setupOutdatedModules(outdatedModules));
        afterEach(tearDown);

        it("should be emitted if outdated modules were found", function (done) {
            reporter = function (emitter) {
                emitter.on("rollback", function (options) {
                    expect(options).to.eql(expectedOptionsWithCurrentCount);
                });
            };

            run({ cwd: process.cwd(), reporter: reporter }, done);
        });
    });

    describe(".emit('rollbackDone')", function () {
        before(setupOutdatedModules(outdatedModules));
        afterEach(tearDown);

        it("should be emitted if outdated modules were found", function (done) {
            reporter = function (emitter) {
                emitter.on("rollbackDone", function (options) {
                    expect(options).to.eql(expectedOptionsWithCurrentCount);
                });
            };

            run({ cwd: process.cwd(), reporter: reporter }, done);
        });
    });

    describe(".emit('updatingDone')", function () {
        before(setupOutdatedModules(outdatedModules));
        afterEach(tearDown);

        it("should be emitted if outdated modules were found", function (done) {
            reporter = function (emitter) {
                emitter.on("updatingDone", function (options) {
                    expect(options).to.eql(expectedOptionsWithCurrentCount);
                });
            };

            run({ cwd: process.cwd(), reporter: reporter }, done);
        });
    });

    describe(".emit('finished')", function () {
        before(setupOutdatedModules(outdatedModules));
        afterEach(tearDown);

        it("should be emitted if outdated modules were found", function (done) {
            reporter = function (emitter) {
                emitter.on("finished", function (options) {
                    expect(options).to.be.undefined; // eslint-disable-line
                });
            };

            run({ cwd: process.cwd(), reporter: reporter }, done);
        });
    });
});
