"use strict";

var childProcess = require("child_process");
var sinon = require("sinon");
var chai = require("chai");
var sinonChai = require("sinon-chai");
var run = require("../lib/run");
var npmFixtures = require("./fixtures/npm");

var expect = chai.expect;
var execBackup;
var expectedOptionsExclude = {
    infos: [
        {
            current: "1.1.4",
            wanted: "1.1.5",
            latest: "2.0.0",
            location: "servus.jsShouldNotBeExcluded",
            type: "dependencies",
            name: "servus.jsShouldNotBeExcluded",
            saveCmd: "--save",
            updateTo: "2.0.0",
        },
        {
            current: "0.1.4",
            wanted: "1.1.5",
            latest: "2.0.0",
            location: "unicons",
            type: "dependencies",
            name: "unicons",
            saveCmd: "--save",
            updateTo: "2.0.0",
        },
    ],
    total: 2,
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
        updateTo: "2.0.0",
    }],
    total: 1,
};
var expectedOptionsVersionGreaterThanLatest = {
    infos: [{
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "xunit-file",
        type: "dependencies",
        name: "xunit-file",
        saveCmd: "--save",
        updateTo: "2.0.0",
    }],
    total: 1,
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
        updateTo: "2.0.0",
    }],
    total: 1,
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
        updateTo: "2.0.0",
    },
    testCmd: "npm test",
    installCmd: "npm i",
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
        updateTo: "2.0.0",
    },
    testCmd: "npm run test",
    installCmd: "npm i",
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
        updateTo: "2.0.0",
    },
    testCmd: "npm test",
    installCmd: "npm i",
    testStdout: "This is the test error stdout",
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
        updateTo: "1.1.5",
    },
    testCmd: "npm test",
    installCmd: "npm i",
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
        updateTo: "1.1.5",
    },
    testCmd: "npm test",
    installCmd: "npm i --registry https://custom.npm.registry",
};
var expectedOptionsWithSaveExact = {
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
        updateTo: "2.0.0",
    },
    testCmd: "npm test",
    installCmd: "npm i --save-exact",
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

function setupOutdated(obj, testsExpectToPass) {
    return function () {
        execBackup = childProcess.exec;
        childProcess.exec = execMock(obj, testsExpectToPass);
    };
}

chai.use(sinonChai);

describe("npm run()", function () {
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
            beforeEach(setupOutdated(npmFixtures.outdated));
            afterEach(tearDown);

            it("should be emitted, if cwd is set", function (done) {
                var onInit = sinon.spy();

                run({
                    cwd: process.cwd(),
                    forceNpm: true,
                    reporter: function (emitter) {
                        emitter.on("init", onInit);
                    },
                }, function (err) {
                    expect(onInit).to.have.been.calledOnce;
                    expect(onInit).to.have.been.calledWithExactly({ cwd: process.cwd() });
                    done(err);
                });
            });
        });

        describe("noop", function () {
            beforeEach(setupOutdated(npmFixtures.noOutdated));
            afterEach(tearDown);

            it("should be emitted if no outdated modules were found", function (done) {
                var onNoop = sinon.spy();

                run({
                    cwd: process.cwd(),
                    forceNpm: true,
                    reporter: function (emitter) {
                        emitter.on("noop", onNoop);
                    },
                }, function (err) {
                    expect(onNoop).to.have.been.calledOnce;
                    expect(onNoop).to.have.been.calledWithExactly();
                    done(err);
                });
            });
        });

        describe("noop", function () {
            beforeEach(setupOutdated(undefined));
            afterEach(tearDown);

            it("should be emitted if npm outdated returns nothing", function (done) {
                var onNoop = sinon.spy();

                run({
                    cwd: process.cwd(),
                    forceNpm: true,
                    reporter: function (emitter) {
                        emitter.on("noop", onNoop);
                    },
                }, function (err) {
                    expect(onNoop).to.have.been.calledOnce;
                    expect(onNoop).to.have.been.calledWithExactly();
                    done(err);
                });
            });
        });

        describe("modulesMissing", function () {
            beforeEach(setupOutdated(npmFixtures.outdatedNotInstalled));
            afterEach(tearDown);

            it("should be emitted if npm outdated returns at least one missing module", function (done) {
                var onModulesMissing = sinon.spy();

                run({
                    cwd: process.cwd(),
                    forceNpm: true,
                    reporter: function (emitter) {
                        emitter.on("modulesMissing", onModulesMissing);
                    },
                }, function (err) {
                    var expectedEvent = {
                        infos: [sinon.match({ name: "servus.js" })],
                    };

                    expect(onModulesMissing).to.have.been.calledOnce;
                    expect(onModulesMissing).to.have.been.calledWithMatch(expectedEvent);
                    done(err);
                });
            });
        });

        describe("outdated", function () {
            describe("if outdated modules were found", function () {
                beforeEach(setupOutdated(npmFixtures.outdated));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    var onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter: function (emitter) {
                            emitter.on("outdated", onOutdated);
                        },
                    }, function (err) {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptions);
                        done(err);
                    });
                });
            });

            describe("if outdated modules were found with excluded one module", function () {
                beforeEach(setupOutdated(npmFixtures.outdatedExclude));
                afterEach(tearDown);

                it("should be emitted without excluded module", function (done) {
                    var onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        exclude: "servus.js",
                        reporter: function (emitter) {
                            emitter.on("outdated", onOutdated);
                        },
                    }, function (err) {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptionsExclude);
                        done(err);
                    });
                });
            });

            describe("if outdated modules were found with excluded more modules", function () {
                beforeEach(setupOutdated(npmFixtures.outdatedExclude));
                afterEach(tearDown);

                it("should be emitted without excluded modules", function (done) {
                    var onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        exclude: "asdf, servus.js",
                        reporter: function (emitter) {
                            emitter.on("outdated", onOutdated);
                        },
                    }, function (err) {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptionsExclude);
                        done(err);
                    });
                });
            });

            describe("if outdated modules were found with unstable modules", function () {
                beforeEach(setupOutdated(npmFixtures.outdatedVersionGreaterThanLatest));
                afterEach(tearDown);

                it("should be emitted without unstable modules", function (done) {
                    var onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter: function (emitter) {
                            emitter.on("outdated", onOutdated);
                        },
                    }, function (err) {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptionsVersionGreaterThanLatest);
                        done(err);
                    });
                });
            });

            describe("if outdated modules were found with unstable modules", function () {
                beforeEach(setupOutdated(npmFixtures.outdatedUnstable));
                afterEach(tearDown);

                it("should be emitted without unstable modules", function (done) {
                    var onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter: function (emitter) {
                            emitter.on("outdated", onOutdated);
                        },
                    }, function (err) {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptionsUnstable);
                        done(err);
                    });
                });
            });

            describe("if outdated modules with git submodules were found", function () {
                beforeEach(setupOutdated(npmFixtures.outdatedWithGitDependencies));
                afterEach(tearDown);

                it("should be emitted without git submodules", function (done) {
                    var onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter: function (emitter) {
                            emitter.on("outdated", onOutdated);
                        },
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
                beforeEach(setupOutdated(npmFixtures.outdated));
                afterEach(tearDown);

                it("should be emitted with latest version to install", function (done) {
                    var onUpdating = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter: function (emitter) {
                            emitter.on("updating", onUpdating);
                        },
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
                        forceNpm: true,
                        wanted: true,
                        reporter: function (emitter) {
                            emitter.on("updating", onUpdating);
                        },
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
                        forceNpm: true,
                        wanted: true,
                        registry: "https://custom.npm.registry",
                        reporter: function (emitter) {
                            emitter.on("updating", onUpdating);
                        },
                    }, function (err) {
                        expect(onUpdating).to.have.been.calledOnce;
                        expect(onUpdating).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountWantedAndSpecifiedRegistry);
                        done(err);
                    });
                });

                it("should be emitted with save exact param", function (done) {
                    var onUpdating = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        saveExact: true,
                        reporter: function (emitter) {
                            emitter.on("updating", onUpdating);
                        },
                    }, function (err) {
                        expect(onUpdating).to.have.been.calledOnce;
                        expect(onUpdating).to.have.been.calledWithExactly(expectedOptionsWithSaveExact);
                        done(err);
                    });
                });
            });

            describe("if no outdated modules were found", function () {
                beforeEach(setupOutdated(npmFixtures.noOutdated));
                afterEach(tearDown);

                it("should not be emitted", function (done) {
                    var onUpdating = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter: function (emitter) {
                            emitter.on("updating", onUpdating);
                        },
                    }, function (err) {
                        expect(onUpdating).to.not.have.been.called;
                        done(err);
                    });
                });
            });
        });

        describe("testing", function () {
            describe("if outdated modules were found", function () {
                beforeEach(setupOutdated(npmFixtures.outdated));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    var onTesting = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter: function (emitter) {
                            emitter.on("testing", onTesting);
                        },
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
                beforeEach(setupOutdated(npmFixtures.outdated));
                afterEach(tearDown);

                it("should be emitted with correct command", function (done) {
                    var onTesting = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        testCmd: "npm run test",
                        reporter: function (emitter) {
                            emitter.on("testing", onTesting);
                        },
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
                beforeEach(setupOutdated(npmFixtures.outdated, false));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    var onRollback = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter: function (emitter) {
                            emitter.on("rollback", onRollback);
                        },
                    }, function (err) {
                        expect(onRollback).to.have.been.calledOnce;
                        expect(onRollback).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountLatest);
                        done(err);
                    });
                });
            });

            describe("if tests are passing", function () {
                beforeEach(setupOutdated(npmFixtures.outdated, true));
                afterEach(tearDown);

                it("should not be emitted", function (done) {
                    var onRollback = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter: function (emitter) {
                            emitter.on("rollback", onRollback);
                        },
                    }, function (err) {
                        expect(onRollback).to.not.have.been.called;
                        done(err);
                    });
                });
            });
        });

        describe("rollbackDone", function () {
            describe("if outdated modules were found", function () {
                beforeEach(setupOutdated(npmFixtures.outdated, false));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    var onRollbackDone = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter: function (emitter) {
                            emitter.on("rollbackDone", onRollbackDone);
                        },
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
                beforeEach(setupOutdated(npmFixtures.outdated, false));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    var onTestStdout = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        testStdout: true,
                        reporter: function (emitter) {
                            emitter.on("testStdout", onTestStdout);
                        },
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
                beforeEach(setupOutdated(npmFixtures.outdated, true));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    var onUpdatingDone = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter: function (emitter) {
                            emitter.on("updatingDone", onUpdatingDone);
                        },
                    }, function (err) {
                        expect(onUpdatingDone).to.have.been.calledOnce;
                        expect(onUpdatingDone).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountLatest);
                        done(err);
                    });
                });
            });
            describe("if tests are failing", function () {
                beforeEach(setupOutdated(npmFixtures.outdated, false));
                afterEach(tearDown);

                it("should not be emitted", function (done) {
                    var onUpdatingDone = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter: function (emitter) {
                            emitter.on("updatingDone", onUpdatingDone);
                        },
                    }, function (err) {
                        expect(onUpdatingDone).to.not.have.been.called;
                        done(err);
                    });
                });
            });
        });

        describe("finished", function () {
            describe("if outdated modules were found", function () {
                beforeEach(setupOutdated(npmFixtures.outdated));
                afterEach(tearDown);

                it("should be emitted", function (done) {
                    var onFinished = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        testStdout: true,
                        reporter: function (emitter) {
                            emitter.on("finished", onFinished);
                        },
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
