"use strict";

const childProcess = require("child_process");
const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require("sinon-chai");
const run = require("../lib/run");
const npmFixtures = require("./fixtures/npm");

const expect = chai.expect;
let execBackup;
const expectedOptionsExclude = {
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
const expectedOptionsUnstable = {
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
const expectedOptionsVersionGreaterThanLatest = {
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
const expectedOptions = {
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
const expectedOptionsWithCurrentCountLatest = {
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
const expectedOptionsWithCurrentCountLatestAndCustomTestCmd = {
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
const expectedOptionsWithCurrentCountLatestAndTestErrors = {
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
const expectedOptionsWithCurrentCountWanted = {
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
const expectedOptionsWithCurrentCountWantedAndSpecifiedRegistry = {
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
const expectedOptionsWithSaveExact = {
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

describe("npm run()", () => {
    it("should throw an error, if no options set", () => {
        expect(run).to.throw(Error);
    });

    it("should throw an error, if cwd is missing", () => {
        expect(() => {
            run({ cwd: 1 });
        }).to.throw(Error);
    });

    describe("events", () => {
        describe("init", () => {
            beforeEach(setupOutdated(npmFixtures.outdated));
            afterEach(tearDown);

            it("should be emitted, if cwd is set", (done) => {
                const onInit = sinon.spy();

                run({
                    cwd: process.cwd(),
                    forceNpm: true,
                    reporter(emitter) {
                        emitter.on("init", onInit);
                    },
                }, (err) => {
                    expect(onInit).to.have.been.calledOnce;
                    expect(onInit).to.have.been.calledWithExactly({ cwd: process.cwd() });
                    done(err);
                });
            });
        });

        describe("noop", () => {
            beforeEach(setupOutdated(npmFixtures.noOutdated));
            afterEach(tearDown);

            it("should be emitted if no outdated modules were found", (done) => {
                const onNoop = sinon.spy();

                run({
                    cwd: process.cwd(),
                    forceNpm: true,
                    reporter(emitter) {
                        emitter.on("noop", onNoop);
                    },
                }, (err) => {
                    expect(onNoop).to.have.been.calledOnce;
                    expect(onNoop).to.have.been.calledWithExactly();
                    done(err);
                });
            });
        });

        describe("noop", () => {
            beforeEach(setupOutdated(undefined));
            afterEach(tearDown);

            it("should be emitted if npm outdated returns nothing", (done) => {
                const onNoop = sinon.spy();

                run({
                    cwd: process.cwd(),
                    forceNpm: true,
                    reporter(emitter) {
                        emitter.on("noop", onNoop);
                    },
                }, (err) => {
                    expect(onNoop).to.have.been.calledOnce;
                    expect(onNoop).to.have.been.calledWithExactly();
                    done(err);
                });
            });
        });

        describe("modulesMissing", () => {
            beforeEach(setupOutdated(npmFixtures.outdatedNotInstalled));
            afterEach(tearDown);

            it("should be emitted if npm outdated returns at least one missing module", (done) => {
                const onModulesMissing = sinon.spy();

                run({
                    cwd: process.cwd(),
                    forceNpm: true,
                    reporter(emitter) {
                        emitter.on("modulesMissing", onModulesMissing);
                    },
                }, (err) => {
                    const expectedEvent = {
                        infos: [sinon.match({ name: "servus.js" })],
                    };

                    expect(onModulesMissing).to.have.been.calledOnce;
                    expect(onModulesMissing).to.have.been.calledWithMatch(expectedEvent);
                    done(err);
                });
            });
        });

        describe("outdated", () => {
            describe("if outdated modules were found", () => {
                beforeEach(setupOutdated(npmFixtures.outdated));
                afterEach(tearDown);

                it("should be emitted", (done) => {
                    const onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter(emitter) {
                            emitter.on("outdated", onOutdated);
                        },
                    }, (err) => {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptions);
                        done(err);
                    });
                });
            });

            describe("if outdated modules were found with excluded one module", () => {
                beforeEach(setupOutdated(npmFixtures.outdatedExclude));
                afterEach(tearDown);

                it("should be emitted without excluded module", (done) => {
                    const onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        exclude: "servus.js",
                        reporter(emitter) {
                            emitter.on("outdated", onOutdated);
                        },
                    }, (err) => {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptionsExclude);
                        done(err);
                    });
                });
            });

            describe("if outdated modules were found with excluded more modules", () => {
                beforeEach(setupOutdated(npmFixtures.outdatedExclude));
                afterEach(tearDown);

                it("should be emitted without excluded modules", (done) => {
                    const onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        exclude: "asdf, servus.js",
                        reporter(emitter) {
                            emitter.on("outdated", onOutdated);
                        },
                    }, (err) => {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptionsExclude);
                        done(err);
                    });
                });
            });

            describe("if outdated modules were found with unstable modules", () => {
                beforeEach(setupOutdated(npmFixtures.outdatedVersionGreaterThanLatest));
                afterEach(tearDown);

                it("should be emitted without unstable modules", (done) => {
                    const onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter(emitter) {
                            emitter.on("outdated", onOutdated);
                        },
                    }, (err) => {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptionsVersionGreaterThanLatest);
                        done(err);
                    });
                });
            });

            describe("if outdated modules were found with unstable modules", () => {
                beforeEach(setupOutdated(npmFixtures.outdatedUnstable));
                afterEach(tearDown);

                it("should be emitted without unstable modules", (done) => {
                    const onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter(emitter) {
                            emitter.on("outdated", onOutdated);
                        },
                    }, (err) => {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptionsUnstable);
                        done(err);
                    });
                });
            });

            describe("if outdated modules with git submodules were found", () => {
                beforeEach(setupOutdated(npmFixtures.outdatedWithGitDependencies));
                afterEach(tearDown);

                it("should be emitted without git submodules", (done) => {
                    const onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter(emitter) {
                            emitter.on("outdated", onOutdated);
                        },
                    }, (err) => {
                        expect(onOutdated).to.have.been.calledOnce;
                        expect(onOutdated).to.have.been.calledWithExactly(expectedOptions);
                        done(err);
                    });
                });
            });
        });

        describe("updating", () => {
            describe("if outdated modules were found", () => {
                beforeEach(setupOutdated(npmFixtures.outdated));
                afterEach(tearDown);

                it("should be emitted with latest version to install", (done) => {
                    const onUpdating = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter(emitter) {
                            emitter.on("updating", onUpdating);
                        },
                    }, (err) => {
                        expect(onUpdating).to.have.been.calledOnce;
                        expect(onUpdating).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountLatest);
                        done(err);
                    });
                });

                it("should be emitted with wanted version to install", (done) => {
                    const onUpdating = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        wanted: true,
                        reporter(emitter) {
                            emitter.on("updating", onUpdating);
                        },
                    }, (err) => {
                        expect(onUpdating).to.have.been.calledOnce;
                        expect(onUpdating).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountWanted);
                        done(err);
                    });
                });

                it("should be emitted with specified registry", (done) => {
                    const onUpdating = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        wanted: true,
                        registry: "https://custom.npm.registry",
                        reporter(emitter) {
                            emitter.on("updating", onUpdating);
                        },
                    }, (err) => {
                        expect(onUpdating).to.have.been.calledOnce;
                        expect(onUpdating).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountWantedAndSpecifiedRegistry);
                        done(err);
                    });
                });

                it("should be emitted with save exact param", (done) => {
                    const onUpdating = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        saveExact: true,
                        reporter(emitter) {
                            emitter.on("updating", onUpdating);
                        },
                    }, (err) => {
                        expect(onUpdating).to.have.been.calledOnce;
                        expect(onUpdating).to.have.been.calledWithExactly(expectedOptionsWithSaveExact);
                        done(err);
                    });
                });
            });

            describe("if no outdated modules were found", () => {
                beforeEach(setupOutdated(npmFixtures.noOutdated));
                afterEach(tearDown);

                it("should not be emitted", (done) => {
                    const onUpdating = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter(emitter) {
                            emitter.on("updating", onUpdating);
                        },
                    }, (err) => {
                        expect(onUpdating).to.not.have.been.called;
                        done(err);
                    });
                });
            });
        });

        describe("testing", () => {
            describe("if outdated modules were found", () => {
                beforeEach(setupOutdated(npmFixtures.outdated));
                afterEach(tearDown);

                it("should be emitted", (done) => {
                    const onTesting = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter(emitter) {
                            emitter.on("testing", onTesting);
                        },
                    }, (err) => {
                        expect(onTesting).to.have.been.calledOnce;
                        expect(onTesting).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountLatest);
                        done(err);
                    });
                });
            });
        });

        describe("testing", () => {
            describe("if custom test command is given", () => {
                beforeEach(setupOutdated(npmFixtures.outdated));
                afterEach(tearDown);

                it("should be emitted with correct command", (done) => {
                    const onTesting = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        testCmd: "npm run test",
                        reporter(emitter) {
                            emitter.on("testing", onTesting);
                        },
                    }, (err) => {
                        expect(onTesting).to.have.been.calledOnce;
                        expect(onTesting).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountLatestAndCustomTestCmd);
                        done(err);
                    });
                });
            });
        });

        describe("rollback", () => {
            describe("if tests are failing", () => {
                beforeEach(setupOutdated(npmFixtures.outdated, false));
                afterEach(tearDown);

                it("should be emitted", (done) => {
                    const onRollback = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter(emitter) {
                            emitter.on("rollback", onRollback);
                        },
                    }, (err) => {
                        expect(onRollback).to.have.been.calledOnce;
                        expect(onRollback).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountLatest);
                        done(err);
                    });
                });
            });

            describe("if tests are passing", () => {
                beforeEach(setupOutdated(npmFixtures.outdated, true));
                afterEach(tearDown);

                it("should not be emitted", (done) => {
                    const onRollback = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter(emitter) {
                            emitter.on("rollback", onRollback);
                        },
                    }, (err) => {
                        expect(onRollback).to.not.have.been.called;
                        done(err);
                    });
                });
            });
        });

        describe("rollbackDone", () => {
            describe("if outdated modules were found", () => {
                beforeEach(setupOutdated(npmFixtures.outdated, false));
                afterEach(tearDown);

                it("should be emitted", (done) => {
                    const onRollbackDone = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter(emitter) {
                            emitter.on("rollbackDone", onRollbackDone);
                        },
                    }, (err) => {
                        expect(onRollbackDone).to.have.been.calledOnce;
                        expect(onRollbackDone).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountLatest);
                        done(err);
                    });
                });
            });
        });

        describe("testStdout", () => {
            describe("if --test-stdout is set and update fails", () => {
                beforeEach(setupOutdated(npmFixtures.outdated, false));
                afterEach(tearDown);

                it("should be emitted", (done) => {
                    const onTestStdout = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        testStdout: true,
                        reporter(emitter) {
                            emitter.on("testStdout", onTestStdout);
                        },
                    }, (err) => {
                        expect(onTestStdout).to.have.been.calledOnce;
                        expect(onTestStdout).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountLatestAndTestErrors);
                        done(err);
                    });
                });
            });
        });

        describe("updatingDone", () => {
            describe("if tests are passing", () => {
                beforeEach(setupOutdated(npmFixtures.outdated, true));
                afterEach(tearDown);

                it("should be emitted", (done) => {
                    const onUpdatingDone = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter(emitter) {
                            emitter.on("updatingDone", onUpdatingDone);
                        },
                    }, (err) => {
                        expect(onUpdatingDone).to.have.been.calledOnce;
                        expect(onUpdatingDone).to.have.been.calledWithExactly(expectedOptionsWithCurrentCountLatest);
                        done(err);
                    });
                });
            });
            describe("if tests are failing", () => {
                beforeEach(setupOutdated(npmFixtures.outdated, false));
                afterEach(tearDown);

                it("should not be emitted", (done) => {
                    const onUpdatingDone = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        reporter(emitter) {
                            emitter.on("updatingDone", onUpdatingDone);
                        },
                    }, (err) => {
                        expect(onUpdatingDone).to.not.have.been.called;
                        done(err);
                    });
                });
            });
        });

        describe("finished", () => {
            describe("if outdated modules were found", () => {
                beforeEach(setupOutdated(npmFixtures.outdated));
                afterEach(tearDown);

                it("should be emitted", (done) => {
                    const onFinished = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        forceNpm: true,
                        testStdout: true,
                        reporter(emitter) {
                            emitter.on("finished", onFinished);
                        },
                    }, (err) => {
                        expect(onFinished).to.have.been.calledOnce;
                        expect(onFinished).to.have.been.calledWithExactly();
                        done(err);
                    });
                });
            });
        });
    });
});
