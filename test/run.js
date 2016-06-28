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

var outdatedModulesNotInstalled = {
    "servus.js": {
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "",
        type: "dependencies"
    },
    unicons: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "unicons",
        type: "dependencies"
    }
};

var outdatedModulesExclude = {
    "servus.js": {
        current: "1.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "unicons",
        type: "dependencies"
    },
    "servus.jsShouldNotBeExclued": {
        current: "1.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "servus.jsShouldNotBeExclued",
        type: "dependencies"
    },
    unicons: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "unicons",
        type: "dependencies"
    }
};

var expectedOptionsExclude = {
    infos: [
        {
            current: "1.1.4",
            wanted: "1.1.5",
            latest: "2.0.0",
            location: "servus.jsShouldNotBeExclued",
            type: "dependencies",
            name: "servus.jsShouldNotBeExclued",
            saveCmd: "--save",
            updateTo: "2.0.0"
        },
        {
            current: "0.1.4",
            wanted: "1.1.5",
            latest: "2.0.0",
            location: "unicons",
            type: "dependencies",
            name: "unicons",
            saveCmd: "--save",
            updateTo: "2.0.0"
        }
    ],
    total: 2
};

var outdatedModulesUnstable = {
    "servus.js": {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0-beta",
        location: "unicons",
        type: "dependencies"
    },
    "xunit-file": {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0-alpha",
        location: "unicons",
        type: "dependencies"
    },
    "npm-stats": {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0-rc",
        location: "unicons",
        type: "dependencies"
    },
    unicons: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "unicons",
        type: "dependencies"
    }
};

var expectedOptionsUnstable = {
    infos: [{
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "unicons",
        type: "dependencies",
        name: "unicons",
        saveCmd: "--save",
        updateTo: "2.0.0"
    }],
    total: 1
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

var outdatedModulesWithVersionGreaterThanLatestInstalled = {
    "xunit-file": {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "xunit-file",
        type: "dependencies"
    },
    unicons: {
        current: "0.1.0",
        wanted: "0.0.5",
        latest: "0.0.5",
        location: "unicons",
        type: "dependencies"
    },
    "servus.js": {
        current: "0.1.0-alpha",
        wanted: "0.0.5",
        latest: "0.0.5",
        location: "servus.js",
        type: "dependencies"
    },
    "babel-eslint": {
        current: "6.0.0-beta.6",
        wanted: "5.0.0",
        latest: "5.0.0",
        location: "babel-eslint",
        type: "dependencies"
    }
};

var expectedOptionsWithVersionGreaterThanLatestInstalled = {
    infos: [{
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "xunit-file",
        type: "dependencies",
        name: "xunit-file",
        saveCmd: "--save",
        updateTo: "2.0.0"
    }],
    total: 1
};

var expectedOptions = {
    infos: [{
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "unicons",
        type: "dependencies",
        name: "unicons",
        saveCmd: "--save",
        updateTo: "2.0.0"
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
    },
    testCmd: "npm test",
    installCmd: "npm i"
};

var expectedOptionsWithCurrentCountLatestAndCustomTestCmd = {
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
    },
    testCmd: "npm run test",
    installCmd: "npm i"
};

var expectedOptionsWithCurrentCountLatestAndTestErrors = {
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
    },
    testCmd: "npm test",
    errors: "This is the test error stdout"
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
    },
    testCmd: "npm test",
    installCmd: "npm i"
};

var expectedOptionsWithCurrentCountWantedAndSpecifiedRegistry = {
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
    },
    testCmd: "npm test",
    installCmd: "npm i --registry https://custom.npm.registry"
};

function tearDown() {
    childProcess.exec = execBackup;
}

function execMock(object, testsExpectToPass) {
    return function (cmd, obj, cb) {
        if (cmd === "npm outdated --json --long --depth=0") {
            setImmediate(cb, null, JSON.stringify(object), null);
        } else if (cmd === "npm test" && !testsExpectToPass) {
            setImmediate(cb, new Error("test failed"), "This is the test error stdout", "This is the test error stderr");
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

        describe("noop", function () {
            before(setupOutdatedModules(undefined));
            afterEach(tearDown);

            it("should be emitted if npm outdated returns nothing", function (done) {
                reporter = function (emitter) {
                    emitter.on("noop", function (options) {
                        expect(options).to.be.undefined; // eslint-disable-line
                    });
                };

                run({ cwd: process.cwd(), reporter: reporter }, done);
            });
        });

        describe("modulesMissing", function () {
            before(setupOutdatedModules(outdatedModulesNotInstalled));
            afterEach(tearDown);

            it("should be emitted if npm outdated returns at least one missing module", function (done) {
                reporter = function (emitter) {
                    emitter.on("modulesMissing", function (options) {
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

            describe("if outdated modules were found with excluded one module", function () {
                before(setupOutdatedModules(outdatedModulesExclude));
                afterEach(tearDown);

                it("should be emitted without excluded module", function (done) {
                    reporter = function (emitter) {
                        emitter.on("outdated", function (options) {
                            expect(options).to.eql(expectedOptionsExclude);
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter, exclude: "servus.js" }, done);
                });
            });

            describe("if outdated modules were found with excluded more modules", function () {
                before(setupOutdatedModules(outdatedModulesExclude));
                afterEach(tearDown);

                it("should be emitted without excluded modules", function (done) {
                    reporter = function (emitter) {
                        emitter.on("outdated", function (options) {
                            expect(options).to.eql(expectedOptionsExclude);
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter, exclude: "asdf, servus.js" }, done);
                });
            });

            describe("if outdated modules were found with unstable modules", function () {
                before(setupOutdatedModules(outdatedModulesWithVersionGreaterThanLatestInstalled));
                afterEach(tearDown);

                it("should be emitted without unstable modules", function (done) {
                    reporter = function (emitter) {
                        emitter.on("outdated", function (options) {
                            expect(options).to.eql(expectedOptionsWithVersionGreaterThanLatestInstalled);
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter }, done);
                });
            });

            describe("if outdated modules were found with unstable modules", function () {
                before(setupOutdatedModules(outdatedModulesUnstable));
                afterEach(tearDown);

                it("should be emitted without unstable modules", function (done) {
                    reporter = function (emitter) {
                        emitter.on("outdated", function (options) {
                            expect(options).to.eql(expectedOptionsUnstable);
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

                    run({ cwd: process.cwd(), reporter: reporter, testCmd: "npm test" }, done);
                });

                it("should be emitted with wanted version to install", function (done) {
                    reporter = function (emitter) {
                        emitter.on("updating", function (options) {
                            expect(options).to.eql(expectedOptionsWithCurrentCountWanted);
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter, wanted: true }, done);
                });

                it("should be emitted with specified registry", function (done) {
                    reporter = function (emitter) {
                        emitter.on("updating", function (options) {
                            expect(options).to.eql(expectedOptionsWithCurrentCountWantedAndSpecifiedRegistry);
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter, wanted: true, registry: "https://custom.npm.registry" }, done);
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
            describe("if outdated modules were found", function () {
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

        describe("testing", function () {
            describe("if custom test command is given", function () {
                before(setupOutdatedModules(outdatedModules));
                afterEach(tearDown);

                it("should be emitted with correct command", function (done) {
                    reporter = function (emitter) {
                        emitter.on("testing", function (options) {
                            expect(options).to.eql(expectedOptionsWithCurrentCountLatestAndCustomTestCmd);
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter, testCmd: "npm run test" }, done);
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

        describe("testStdout", function () {
            describe("if --test-stdout is set and update fails", function () {
                before(setupOutdatedModules(outdatedModules, false));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    reporter = function (emitter) {
                        emitter.on("testStdout", function (options) {
                            expect(options).to.eql(expectedOptionsWithCurrentCountLatestAndTestErrors);
                        });
                    };

                    run({ cwd: process.cwd(), reporter: reporter, testStdout: true }, done);
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

                    run({ cwd: process.cwd(), reporter: reporter, testCmd: "npm test" }, done);
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

                    run({ cwd: process.cwd(), reporter: reporter, testCmd: "npm test" }, done);
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

                    run({ cwd: process.cwd(), reporter: reporter, testCmd: "npm test" }, done);
                });
            });
        });
    });
});
