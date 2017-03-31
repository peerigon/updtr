"use strict";

var childProcess = require("child_process");
var sinon = require("sinon");
var chai = require("chai");
var sinonChai = require("sinon-chai");
var rewire = require("rewire");
var run = rewire("../lib/run");

var expect = chai.expect;
var execBackup;
var noOutdatedModules = {};
var outdatedModules = {
    type: "table",
    data: {
        head: ["Package", "Current", "Wanted", "Latest", "Package Type", "URL"],
        body: [
            [
                "unicons",
                "0.1.4",
                "1.1.5",
                "2.0.0",
                "dependencies"
            ]
        ]
    }
};
var outdatedModulesExclude = {
    type: "table",
    data: {
        head: ["Package", "Current", "Wanted", "Latest", "Package Type", "URL"],
        body: [
            [
                "servus.js",
                "1.1.4",
                "1.1.5",
                "2.0.0",
                "dependencies"
            ], [
                "servus.jsShouldNotBeExclued",
                "1.1.4",
                "1.1.5",
                "2.0.0",
                "dependencies"
            ], [
                "unicons",
                "0.1.4",
                "1.1.5",
                "2.0.0",
                "dependencies"
            ]
        ]
    }
};
var expectedOptionsExclude = {
    infos: [
        {
            current: "1.1.4",
            wanted: "1.1.5",
            latest: "2.0.0",
            type: "dependencies",
            name: "servus.jsShouldNotBeExclued",
            saveCmd: "",
            updateTo: "2.0.0"
        },
        {
            current: "0.1.4",
            wanted: "1.1.5",
            latest: "2.0.0",
            type: "dependencies",
            name: "unicons",
            saveCmd: "",
            updateTo: "2.0.0"
        }
    ],
    total: 2
};
var outdatedModulesUnstable = {
    type: "table",
    data: {
        head: ["Package", "Current", "Wanted", "Latest", "Package Type", "URL"],
        body: [
            [
                "servus.js",
                "0.1.4",
                "1.1.5",
                "2.0.0-beta",
                "dependencies"
            ], [
                "xunit-file",
                "0.1.4",
                "1.1.5",
                "2.0.0-alpha",
                "dependencies"
            ], [
                "npm-stats",
                "0.1.4",
                "1.1.5",
                "2.0.0-rc",
                "dependencies"
            ], [
                "unicons",
                "0.1.4",
                "1.1.5",
                "2.0.0",
                "dependencies"
            ]
        ]
    }
};
var expectedOptionsUnstable = {
    infos: [{
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        type: "dependencies",
        name: "unicons",
        saveCmd: "",
        updateTo: "2.0.0"
    }],
    total: 1
};
var outdatedModulesWithGitDependencies = {
    type: "table",
    data: {
        head: ["Package", "Current", "Wanted", "Latest", "Package Type", "URL"],
        body: [
            [
                "unicons",
                "0.1.4",
                "1.1.5",
                "2.0.0",
                "dependencies"
            ], [
                "xunit-file",
                "0.0.7",
                "exotic",
                "exotic",
                "dependencies"
            ], [
                "servus.js",
                "0.0.1",
                "exotic",
                "exotic",
                "dependencies"
            ]
        ]
    }
};
var outdatedModulesWithVersionGreaterThanLatestInstalled = {
    type: "table",
    data: {
        head: ["Package", "Current", "Wanted", "Latest", "Package Type", "URL"],
        body: [
            [
                "xunit-file",
                "0.1.4",
                "1.1.5",
                "2.0.0",
                "dependencies"
            ], [
                "unicons",
                "0.1.0",
                "0.0.5",
                "0.0.5",
                "dependencies"
            ], [
                "servus.js",
                "0.1.0-alpha",
                "0.0.5",
                "0.0.5",
                "dependencies"
            ], [
                "babel-eslint",
                "6.0.0-beta.6",
                "5.0.0",
                "5.0.0",
                "dependencies"
            ]
        ]
    }
};
var expectedOptionsWithVersionGreaterThanLatestInstalled = {
    infos: [{
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        type: "dependencies",
        name: "xunit-file",
        saveCmd: "",
        updateTo: "2.0.0"
    }],
    total: 1
};
var expectedOptions = {
    infos: [{
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        type: "dependencies",
        name: "unicons",
        saveCmd: "",
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
        type: "dependencies",
        name: "unicons",
        saveCmd: "",
        updateTo: "2.0.0"
    },
    testCmd: "yarn test",
    installCmd: "yarn add"
};
var expectedOptionsWithCurrentCountLatestAndCustomTestCmd = {
    current: 1,
    total: 1,
    info: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        type: "dependencies",
        name: "unicons",
        saveCmd: "",
        updateTo: "2.0.0"
    },
    testCmd: "yarn run test",
    installCmd: "yarn add"
};
var expectedOptionsWithCurrentCountLatestAndTestErrors = {
    current: 1,
    total: 1,
    info: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        type: "dependencies",
        name: "unicons",
        saveCmd: "",
        updateTo: "2.0.0"
    },
    testCmd: "yarn test",
    installCmd: "yarn add",
    testStdout: "This is the test error stdout"
};
var expectedOptionsWithCurrentCountWanted = {
    current: 1,
    total: 1,
    info: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        type: "dependencies",
        name: "unicons",
        saveCmd: "",
        updateTo: "1.1.5"
    },
    testCmd: "yarn test",
    installCmd: "yarn add"
};
var expectedOptionsWithCurrentCountWantedAndSpecifiedRegistry = {
    current: 1,
    total: 1,
    info: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        type: "dependencies",
        name: "unicons",
        saveCmd: "",
        updateTo: "1.1.5"
    },
    testCmd: "yarn test",
    installCmd: "yarn add --registry https://custom.npm.registry"
};

function tearDown() {
    childProcess.exec = execBackup;
}

function execMock(object, testsExpectToPass) {
    return function (cmd, obj, cb) {
        if (cmd === "yarn outdated --json --flat") {
            setImmediate(cb, null, JSON.stringify(object), null);
        } else if (cmd === "yarn test" && !testsExpectToPass) {
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

chai.use(sinonChai);

describe("yarn run()", function () {
    var fsMock = {
        existsSync: function () {
            return true;
        }
    };

    run.__set__("fs", fsMock);

    it("should throw an error, if no options set", function () {
        expect(run).to.throw(Error);
    });

    it("should throw an error, if cwd is missing", function () {
        expect(function () {
            run({ cwd: 1 });
        }).to.throw(Error);
    });

    describe("events", function () {
        describe("init", function () {
            beforeEach(setupOutdatedModules(outdatedModules));
            afterEach(tearDown);

            it("should be emitted, if cwd is set", function (done) {
                var onInit = sinon.spy();

                run({
                    cwd: process.cwd(),
                    reporter: function (emitter) {
                        emitter.on("init", onInit);
                    }
                }, function (err) {
                    expect(onInit).to.have.been.calledOnce;
                    expect(onInit).to.have.been.calledWithExactly({ cwd: process.cwd() });
                    done(err);
                });
            });
        });

        describe("noop", function () {
            beforeEach(setupOutdatedModules(noOutdatedModules));
            afterEach(tearDown);

            it("should be emitted if no outdated modules were found", function (done) {
                var onNoop = sinon.spy();

                run({
                    cwd: process.cwd(),
                    reporter: function (emitter) {
                        emitter.on("noop", onNoop);
                    }
                }, function (err) {
                    expect(onNoop).to.have.been.calledOnce;
                    expect(onNoop).to.have.been.calledWithExactly();
                    done(err);
                });
            });
        });

        describe("noop", function () {
            beforeEach(setupOutdatedModules(undefined));
            afterEach(tearDown);

            it("should be emitted if npm outdated returns nothing", function (done) {
                var onNoop = sinon.spy();

                run({
                    cwd: process.cwd(),
                    reporter: function (emitter) {
                        emitter.on("noop", onNoop);
                    }
                }, function (err) {
                    expect(onNoop).to.have.been.calledOnce;
                    expect(onNoop).to.have.been.calledWithExactly();
                    done(err);
                });
            });
        });

        describe("outdated", function () {
            describe("if outdated modules were found", function () {
                beforeEach(setupOutdatedModules(outdatedModules));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    var onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        reporter: function (emitter) {
                            emitter.on("outdated", onOutdated);
                        }
                    }, function (err) {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptions);
                        done(err);
                    });
                });
            });

            describe("if outdated modules were found with excluded one module", function () {
                beforeEach(setupOutdatedModules(outdatedModulesExclude));
                afterEach(tearDown);

                it("should be emitted without excluded module", function (done) {
                    var onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        exclude: "servus.js",
                        reporter: function (emitter) {
                            emitter.on("outdated", onOutdated);
                        }
                    }, function (err) {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptionsExclude);
                        done(err);
                    });
                });
            });

            describe("if outdated modules were found with excluded more modules", function () {
                beforeEach(setupOutdatedModules(outdatedModulesExclude));
                afterEach(tearDown);

                it("should be emitted without excluded modules", function (done) {
                    var onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        exclude: "asdf, servus.js",
                        reporter: function (emitter) {
                            emitter.on("outdated", onOutdated);
                        }
                    }, function (err) {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptionsExclude);
                        done(err);
                    });
                });
            });

            describe("if outdated modules were found with unstable modules", function () {
                beforeEach(setupOutdatedModules(outdatedModulesWithVersionGreaterThanLatestInstalled));
                afterEach(tearDown);

                it("should be emitted without unstable modules", function (done) {
                    var onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        reporter: function (emitter) {
                            emitter.on("outdated", onOutdated);
                        }
                    }, function (err) {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptionsWithVersionGreaterThanLatestInstalled);
                        done(err);
                    });
                });
            });

            describe("if outdated modules were found with unstable modules", function () {
                beforeEach(setupOutdatedModules(outdatedModulesUnstable));
                afterEach(tearDown);

                it("should be emitted without unstable modules", function (done) {
                    var onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        reporter: function (emitter) {
                            emitter.on("outdated", onOutdated);
                        }
                    }, function (err) {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptionsUnstable);
                        done(err);
                    });
                });
            });

            describe("if outdated modules with git submodules were found", function () {
                beforeEach(setupOutdatedModules(outdatedModulesWithGitDependencies));
                afterEach(tearDown);

                it("should be emitted without git submodules", function (done) {
                    var onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        reporter: function (emitter) {
                            emitter.on("outdated", onOutdated);
                        }
                    }, function (err) {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptions);
                        done(err);
                    });
                });
            });
        });

        describe("updating", function () {
            describe("if outdated modules were found", function () {
                beforeEach(setupOutdatedModules(outdatedModules));
                afterEach(tearDown);

                it("should be emitted with latest version to install", function (done) {
                    var onUpdating = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        reporter: function (emitter) {
                            emitter.on("updating", onUpdating);
                        }
                    }, function (err) {
                        expect(onUpdating).to.have.been.calledOnce;
                        expect(onUpdating).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountLatest);
                        done(err);
                    });
                });

                it("should be emitted with wanted version to install", function (done) {
                    var onUpdating = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        wanted: true,
                        reporter: function (emitter) {
                            emitter.on("updating", onUpdating);
                        }
                    }, function (err) {
                        expect(onUpdating).to.have.been.calledOnce;
                        expect(onUpdating).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountWanted);
                        done(err);
                    });
                });

                it("should be emitted with specified registry", function (done) {
                    var onUpdating = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        wanted: true,
                        registry: "https://custom.npm.registry",
                        reporter: function (emitter) {
                            emitter.on("updating", onUpdating);
                        }
                    }, function (err) {
                        expect(onUpdating).to.have.been.calledOnce;
                        expect(onUpdating).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountWantedAndSpecifiedRegistry);
                        done(err);
                    });
                });
            });

            describe("if no outdated modules were found", function () {
                beforeEach(setupOutdatedModules(noOutdatedModules));
                afterEach(tearDown);

                it("should not be emitted", function (done) {
                    var onUpdating = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        reporter: function (emitter) {
                            emitter.on("updating", onUpdating);
                        }
                    }, function (err) {
                        expect(onUpdating).to.not.have.been.called;
                        done(err);
                    });
                });
            });
        });

        describe("testing", function () {
            describe("if outdated modules were found", function () {
                beforeEach(setupOutdatedModules(outdatedModules));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    var onTesting = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        reporter: function (emitter) {
                            emitter.on("testing", onTesting);
                        }
                    }, function (err) {
                        expect(onTesting).to.have.been.calledOnce;
                        expect(onTesting).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountLatest);
                        done(err);
                    });
                });
            });
        });

        describe("testing", function () {
            describe("if custom test command is given", function () {
                beforeEach(setupOutdatedModules(outdatedModules));
                afterEach(tearDown);

                it("should be emitted with correct command", function (done) {
                    var onTesting = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        testCmd: "yarn run test",
                        reporter: function (emitter) {
                            emitter.on("testing", onTesting);
                        }
                    }, function (err) {
                        expect(onTesting).to.have.been.calledOnce;
                        expect(onTesting).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountLatestAndCustomTestCmd);
                        done(err);
                    });
                });
            });
        });

        describe("rollback", function () {
            describe("if tests are failing", function () {
                beforeEach(setupOutdatedModules(outdatedModules, false));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    var onRollback = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        reporter: function (emitter) {
                            emitter.on("rollback", onRollback);
                        }
                    }, function (err) {
                        expect(onRollback).to.have.been.calledOnce;
                        expect(onRollback).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountLatest);
                        done(err);
                    });
                });
            });

            describe("if tests are passing", function () {
                beforeEach(setupOutdatedModules(outdatedModules, true));
                afterEach(tearDown);

                it("should not be emitted", function (done) {
                    var onRollback = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        reporter: function (emitter) {
                            emitter.on("rollback", onRollback);
                        }
                    }, function (err) {
                        expect(onRollback).to.not.have.been.called;
                        done(err);
                    });
                });
            });
        });

        describe("rollbackDone", function () {
            describe("if outdated modules were found", function () {
                beforeEach(setupOutdatedModules(outdatedModules, false));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    var onRollbackDone = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        reporter: function (emitter) {
                            emitter.on("rollbackDone", onRollbackDone);
                        }
                    }, function (err) {
                        expect(onRollbackDone).to.have.been.calledOnce;
                        expect(onRollbackDone).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountLatest);
                        done(err);
                    });
                });
            });
        });

        describe("testStdout", function () {
            describe("if --test-stdout is set and update fails", function () {
                beforeEach(setupOutdatedModules(outdatedModules, false));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    var onTestStdout = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        testStdout: true,
                        reporter: function (emitter) {
                            emitter.on("testStdout", onTestStdout);
                        }
                    }, function (err) {
                        expect(onTestStdout).to.have.been.calledOnce;
                        expect(onTestStdout).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountLatestAndTestErrors);
                        done(err);
                    });
                });
            });
        });

        describe("updatingDone", function () {
            describe("if tests are passing", function () {
                beforeEach(setupOutdatedModules(outdatedModules, true));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    var onUpdatingDone = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        reporter: function (emitter) {
                            emitter.on("updatingDone", onUpdatingDone);
                        }
                    }, function (err) {
                        expect(onUpdatingDone).to.have.been.calledOnce;
                        expect(onUpdatingDone).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountLatest);
                        done(err);
                    });
                });
            });
            describe("if tests are failing", function () {
                beforeEach(setupOutdatedModules(outdatedModules, false));
                afterEach(tearDown);

                it("should not be emitted", function (done) {
                    var onUpdatingDone = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        reporter: function (emitter) {
                            emitter.on("updatingDone", onUpdatingDone);
                        }
                    }, function (err) {
                        expect(onUpdatingDone).to.not.have.been.called;
                        done(err);
                    });
                });
            });
        });

        describe("finished", function () {
            describe("if outdated modules were found", function () {
                beforeEach(setupOutdatedModules(outdatedModules));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    var onFinished = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        testStdout: true,
                        reporter: function (emitter) {
                            emitter.on("finished", onFinished);
                        }
                    }, function (err) {
                        expect(onFinished).to.have.been.calledOnce;
                        expect(onFinished).to.have.been.calledWithExactly();
                        done(err);
                    });
                });
            });
        });
    });
});
