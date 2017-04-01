"use strict";

const childProcess = require("child_process");
const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require("sinon-chai");
const rewire = require("rewire");
const yarnFixtures = require("./fixtures/yarn");

const run = rewire("../lib/run");

const expect = chai.expect;
let execBackup;
const noOutdated = {};
const expectedOptionsExclude = {
    infos: [
        {
            current: "1.1.4",
            wanted: "1.1.5",
            latest: "2.0.0",
            type: "dependencies",
            name: "servus.jsShouldNotBeExclued",
            saveCmd: "",
            updateTo: "2.0.0",
        },
        {
            current: "0.1.4",
            wanted: "1.1.5",
            latest: "2.0.0",
            type: "dependencies",
            name: "unicons",
            saveCmd: "",
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
        type: "dependencies",
        name: "unicons",
        saveCmd: "",
        updateTo: "2.0.0",
    }],
    total: 1,
};
const expectedOptionsVersionGreaterThanLatest = {
    infos: [{
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        type: "dependencies",
        name: "xunit-file",
        saveCmd: "",
        updateTo: "2.0.0",
    }],
    total: 1,
};
const expectedOptions = {
    infos: [{
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        type: "dependencies",
        name: "unicons",
        saveCmd: "",
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
        type: "dependencies",
        name: "unicons",
        saveCmd: "",
        updateTo: "2.0.0",
    },
    testCmd: "yarn test",
    installCmd: "yarn add",
};
const expectedOptionsWithCurrentCountLatestAndCustomTestCmd = {
    current: 1,
    total: 1,
    info: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        type: "dependencies",
        name: "unicons",
        saveCmd: "",
        updateTo: "2.0.0",
    },
    testCmd: "yarn run test",
    installCmd: "yarn add",
};
const expectedOptionsWithCurrentCountLatestAndTestErrors = {
    current: 1,
    total: 1,
    info: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        type: "dependencies",
        name: "unicons",
        saveCmd: "",
        updateTo: "2.0.0",
    },
    testCmd: "yarn test",
    installCmd: "yarn add",
    testStdout: "This is the test error stdout",
};
const expectedOptionsWithCurrentCountWanted = {
    current: 1,
    total: 1,
    info: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        type: "dependencies",
        name: "unicons",
        saveCmd: "",
        updateTo: "1.1.5",
    },
    testCmd: "yarn test",
    installCmd: "yarn add",
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

function setupOutdated(obj, testsExpectToPass) {
    return function () {
        execBackup = childProcess.exec;
        childProcess.exec = execMock(obj, testsExpectToPass);
    };
}

chai.use(sinonChai);

describe("yarn run()", () => {
    const fsMock = {
        existsSync() {
            return true;
        },
    };

    run.__set__("fs", fsMock);

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
            beforeEach(setupOutdated(yarnFixtures.outdated));
            afterEach(tearDown);

            it("should be emitted, if cwd is set", (done) => {
                const onInit = sinon.spy();

                run({
                    cwd: process.cwd(),
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
            beforeEach(setupOutdated(noOutdated));
            afterEach(tearDown);

            it("should be emitted if no outdated modules were found", (done) => {
                const onNoop = sinon.spy();

                run({
                    cwd: process.cwd(),
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

        describe("outdated", () => {
            describe("if outdated modules were found", () => {
                beforeEach(setupOutdated(yarnFixtures.outdated));
                afterEach(tearDown);

                it("should be emitted", (done) => {
                    const onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
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
                beforeEach(setupOutdated(yarnFixtures.outdatedExclude));
                afterEach(tearDown);

                it("should be emitted without excluded module", (done) => {
                    const onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
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
                beforeEach(setupOutdated(yarnFixtures.outdatedExclude));
                afterEach(tearDown);

                it("should be emitted without excluded modules", (done) => {
                    const onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
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
                beforeEach(setupOutdated(yarnFixtures.outdatedVersionGreaterThanLatest));
                afterEach(tearDown);

                it("should be emitted without unstable modules", (done) => {
                    const onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
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
                beforeEach(setupOutdated(yarnFixtures.outdatedUnstable));
                afterEach(tearDown);

                it("should be emitted without unstable modules", (done) => {
                    const onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
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
                beforeEach(setupOutdated(yarnFixtures.outdatedWithGitDependencies));
                afterEach(tearDown);

                it("should be emitted without git submodules", (done) => {
                    const onOutdated = sinon.spy();

                    run({
                        cwd: process.cwd(),
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
                beforeEach(setupOutdated(yarnFixtures.outdated));
                afterEach(tearDown);

                it("should be emitted with latest version to install", (done) => {
                    const onUpdating = sinon.spy();

                    run({
                        cwd: process.cwd(),
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

                it("should be abort with specified registry since yarn does not support it yet", (done) => {
                    function runIt() {
                        run({
                            cwd: process.cwd(),
                            wanted: true,
                            registry: "https://custom.npm.registry",
                        });
                    }
                    expect(runIt).to.throw(/`yarn add` does not support custom registries yet. Please use a .npmrc file to achieve this./);
                    done();
                });
            });

            describe("if no outdated modules were found", () => {
                beforeEach(setupOutdated(noOutdated));
                afterEach(tearDown);

                it("should not be emitted", (done) => {
                    const onUpdating = sinon.spy();

                    run({
                        cwd: process.cwd(),
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
                beforeEach(setupOutdated(yarnFixtures.outdated));
                afterEach(tearDown);

                it("should be emitted", (done) => {
                    const onTesting = sinon.spy();

                    run({
                        cwd: process.cwd(),
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
                beforeEach(setupOutdated(yarnFixtures.outdated));
                afterEach(tearDown);

                it("should be emitted with correct command", (done) => {
                    const onTesting = sinon.spy();

                    run({
                        cwd: process.cwd(),
                        testCmd: "yarn run test",
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
                beforeEach(setupOutdated(yarnFixtures.outdated, false));
                afterEach(tearDown);

                it("should be emitted", (done) => {
                    const onRollback = sinon.spy();

                    run({
                        cwd: process.cwd(),
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
                beforeEach(setupOutdated(yarnFixtures.outdated, true));
                afterEach(tearDown);

                it("should not be emitted", (done) => {
                    const onRollback = sinon.spy();

                    run({
                        cwd: process.cwd(),
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
                beforeEach(setupOutdated(yarnFixtures.outdated, false));
                afterEach(tearDown);

                it("should be emitted", (done) => {
                    const onRollbackDone = sinon.spy();

                    run({
                        cwd: process.cwd(),
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
                beforeEach(setupOutdated(yarnFixtures.outdated, false));
                afterEach(tearDown);

                it("should be emitted", (done) => {
                    const onTestStdout = sinon.spy();

                    run({
                        cwd: process.cwd(),
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
                beforeEach(setupOutdated(yarnFixtures.outdated, true));
                afterEach(tearDown);

                it("should be emitted", (done) => {
                    const onUpdatingDone = sinon.spy();

                    run({
                        cwd: process.cwd(),
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
                beforeEach(setupOutdated(yarnFixtures.outdated, false));
                afterEach(tearDown);

                it("should not be emitted", (done) => {
                    const onUpdatingDone = sinon.spy();

                    run({
                        cwd: process.cwd(),
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
                beforeEach(setupOutdated(yarnFixtures.outdated));
                afterEach(tearDown);

                it("should be emitted", (done) => {
                    const onFinished = sinon.spy();

                    run({
                        cwd: process.cwd(),
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
