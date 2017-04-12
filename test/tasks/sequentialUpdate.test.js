import sequentialUpdate from "../../src/tasks/sequentialUpdate";
import FakeUpdtr from "../helpers/FakeUpdtr";
import createUpdateTask from "../../src/tasks/util/createUpdateTask";
import readFixtures from "../helpers/readFixtures";
import parse from "../../src/exec/parse";
import {
    ready as execResultsReady,
    execError,
    update,
    testPass,
    testFail,
    errorExecUpdate,
    errorExecRollback,
} from "../fixtures/execResults";

let stdoutLogs;

function createUpdateTasks(updtrConfig) {
    const packageManager = updtrConfig.use;
    const outdated = parse[packageManager].outdated(
        stdoutLogs.get(`outdated/outdated.${ packageManager }.log`)
    );

    return outdated.map(outdated => createUpdateTask(outdated, updtrConfig));
}

beforeAll(async () => {
    stdoutLogs = await readFixtures([
        "outdated/outdated.npm.log",
        "outdated/outdated.yarn.log",
    ]);
    await execResultsReady;
});

describe("sequentialUpdate()", () => {
    describe("when the given updateTasks array is empty", () => {
        test("should resolve immediately without emitting events", async () => {
            const updtr = new FakeUpdtr();

            await sequentialUpdate(updtr, []);

            expect(updtr.exec.args).toMatchSnapshot();
            expect(updtr.emit.args).toMatchSnapshot();
        });
    });
    describe("when the given updateTasks array contains update tasks", () => {
        describe("using npm", () => {
            describe("when the tests succeed", () => {
                test("should return the expected update results", async () => {
                    const updtr = new FakeUpdtr();
                    const updateTasks = createUpdateTasks(updtr.config);

                    updtr.execResults = update.concat(
                        testPass,
                        update,
                        testPass
                    );

                    const updateResults = await sequentialUpdate(
                        updtr,
                        updateTasks
                    );

                    expect(updateResults).toMatchSnapshot(
                        "updateResults success"
                    );
                });
            });
            describe("when the first test fails and the rest succeeds", () => {
                test("should emit expected events and execute expected commands", async () => {
                    const updtr = new FakeUpdtr();
                    const updateTasks = createUpdateTasks(updtr.config);

                    updtr.execResults = update.concat(testFail, testPass);

                    const updateResults = await sequentialUpdate(
                        updtr,
                        updateTasks
                    );

                    expect(updtr.exec.args).toMatchSnapshot("exec.args npm");
                    expect(updtr.emit.args).toMatchSnapshot("emit.args npm");
                    expect(updateResults).toMatchSnapshot(
                        "updateResults one fail rest pass"
                    );
                });
            });
        });
        describe("using yarn", () => {
            describe("when the tests succeed", () => {
                test("should return the expected update results", async () => {
                    const updtr = new FakeUpdtr({
                        use: "yarn",
                    });
                    const updateTasks = createUpdateTasks(updtr.config);

                    updtr.execResults = update.concat(
                        testPass,
                        update,
                        testPass
                    );

                    const updateResults = await sequentialUpdate(
                        updtr,
                        updateTasks
                    );

                    expect(updateResults).toMatchSnapshot(
                        "updateResults success"
                    );
                });
            });
            describe("when the first test fails and the rest succeeds", () => {
                test("should emit expected events and execute expected commands", async () => {
                    const updtr = new FakeUpdtr({
                        use: "yarn",
                    });
                    const updateTasks = createUpdateTasks(updtr.config);

                    updtr.execResults = update.concat(testFail, testPass);

                    const updateResults = await sequentialUpdate(
                        updtr,
                        updateTasks
                    );

                    expect(updtr.exec.args).toMatchSnapshot("exec.args yarn");
                    expect(updtr.emit.args).toMatchSnapshot("emit.args yarn");
                    expect(updateResults).toMatchSnapshot(
                        "updateResults one fail rest pass"
                    );
                });
            });
        });
    });
    describe("unexpected errors", () => {
        test("should completely bail out if the update cmd exits with a non-zero exit code", async () => {
            const updtr = new FakeUpdtr();
            const updateTasks = createUpdateTasks(updtr.config);
            let givenErr;

            updtr.execResults = errorExecUpdate;

            try {
                await sequentialUpdate(updtr, updateTasks);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toBe(execError);
            // emitted events: start, updating
            expect(updtr.emit.args.length).toBe(2);
        });
        test("should completely bail out if the rollback cmd exits with a non-zero exit code", async () => {
            const updtr = new FakeUpdtr();
            const updateTasks = createUpdateTasks(updtr.config);
            let givenErr;

            updtr.execResults = errorExecRollback;

            try {
                await sequentialUpdate(updtr, updateTasks);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toBe(execError);
            // emitted events: start, updating, testing, testResult, rollback
            expect(updtr.emit.args.length).toBe(5);
        });
    });
});
