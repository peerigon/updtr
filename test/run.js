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

var expectedOptionsWithCurrentCountLatest = {
    current: 1,
    total: 1,
    info: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "unicons",
        type: "dependencies",
        name: "unicons",
        saveCmd: "--save",
        updateTo: "2.0.0"
    }
};

var expectedOptionsWithCurrentCountWanted = {
    current: 1,
    total: 1,
    info: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "unicons",
        type: "dependencies",
        name: "unicons",
        saveCmd: "--save",
        updateTo: "1.1.5"
    }
};

function tearDown() {
    childProcess.exec = execBackup;
}

function execMock(object, testsExpectToPass) {
    return function (cmd, obj, cb) {
        if (cmd === "npm outdated --json --long --depth=0") {
            setImmediate(cb, null, JSON.stringify(object), null);
        } else if (cmd === "npm test" && !testsExpectToPass) {
            setImmediate(cb, new Error());
        } else {
            setImmediate(cb, null);
        }
    };
}

function setupOutdatedModules(obj, testsExpectToPass) {
    return function () {
        execBackup = childProcess.exec;
        childProcess.exec = execMock(obj, testsExpectToPass);
    };
}

describe("run()", function () {
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

    describe("events", function () {
        describe("init", function () {
            before(setupOutdatedModules(outdatedModules));

            after(tearDown);

            it("should be emitted, if cwd is set", function (done) {
                reporter = function (emitter) {
                    emitter.on("init", function (options) {
                        expect(options).to.eql({ cwd: process.cwd() });
                    });
                };

                run({ cwd: process.cwd(), reporter: reporter }, done);
            });
        });

        describe("noop", function () {
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

        describe("outdated", function () {
            describe("if outdated modules were found", function () {
                before(setupOutdatedModules(outdatedModules));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    reporter = function (emitter) {
                        emitter.on("outdated", function (options) {
                            expect(options).to.eql(expectedOptions);
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter }, done);
                });
            });

            describe("if outdated modules with git submodules were found", function () {
                before(setupOutdatedModules(outdatedModulesWithGitDependencies));
                afterEach(tearDown);

                it("should be emitted without git submodules", function (done) {
                    reporter = function (emitter) {
                        emitter.on("outdated", function (options) {
                            expect(options).to.eql(expectedOptions);
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter }, done);
                });
            });
        });

        describe("updating", function () {
            describe("if outdated modules were found", function () {
                beforeEach(setupOutdatedModules(outdatedModules));
                afterEach(tearDown);

                it("should be emitted with latest version to install", function (done) {
                    reporter = function (emitter) {
                        emitter.on("updating", function (options) {
                            expect(options).to.eql(expectedOptionsWithCurrentCountLatest);
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter }, done);
                });

                it("should be emitted with wanted version to install", function (done) {
                    reporter = function (emitter) {
                        emitter.on("updating", function (options) {
                            expect(options).to.eql(expectedOptionsWithCurrentCountWanted);
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter, wanted: true }, done);
                });
            });

            describe("if no outdated modules were found", function () {
                before(setupOutdatedModules(noOutdatedModules));
                afterEach(tearDown);

                it("should not be emitted", function (done) {
                    reporter = function (emitter) {
                        emitter.on("updating", function () {
                            throw new Error();
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter }, done);
                });
            });
        });

        describe("testing", function () {
            describe("if outdated moudles were found", function () {
                before(setupOutdatedModules(outdatedModules));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    reporter = function (emitter) {
                        emitter.on("testing", function (options) {
                            expect(options).to.eql(expectedOptionsWithCurrentCountLatest);
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter }, done);
                });
            });
        });

        describe("rollback", function () {
            describe("if tests are failing", function () {
                before(setupOutdatedModules(outdatedModules, false));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    reporter = function (emitter) {
                        emitter.on("rollback", function (options) {
                            expect(options).to.eql(expectedOptionsWithCurrentCountLatest);
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter }, done);
                });
            });

            describe("if tests are passing", function () {
                before(setupOutdatedModules(outdatedModules, true));
                afterEach(tearDown);

                it("should not be emitted", function (done) {
                    reporter = function (emitter) {
                        emitter.on("rollback", function (options) {
                            throw new Error();
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter }, done);
                });
            });
        });

        describe("rollbackDone", function () {
            describe("if outdated modules were found", function () {
                before(setupOutdatedModules(outdatedModules, false));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    reporter = function (emitter) {
                        emitter.on("rollbackDone", function (options) {
                            expect(options).to.eql(expectedOptionsWithCurrentCountLatest);
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter }, done);
                });
            });
        });

        describe("updatingDone", function () {
            describe("if tests are passing", function () {
                before(setupOutdatedModules(outdatedModules, true));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    reporter = function (emitter) {
                        emitter.on("updatingDone", function (options) {
                            expect(options).to.eql(expectedOptionsWithCurrentCountLatest);
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter }, done);
                });
            });
            describe("if tests are failing", function () {
                before(setupOutdatedModules(outdatedModules, false));
                afterEach(tearDown);

                it("should not be emitted", function (done) {
                    reporter = function (emitter) {
                        emitter.on("updatingDone", function (options) {
                            throw new Error();
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter }, done);
                });
            });
        });

        describe("finished", function () {
            describe("if outdated modules were found", function () {
                before(setupOutdatedModules(outdatedModules));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    reporter = function (emitter) {
                        emitter.on("finished", function (options) {
                            expect(options).to.be.undefined; // eslint-disable-line
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter }, done);
                });
            });
        });
    });
});
