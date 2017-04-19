import batchUpdate from "../../src/tasks/batchUpdate";
import FakeUpdtr from "../helpers/FakeUpdtr";
import createUpdateTask from "../../src/tasks/util/createUpdateTask";
import readFixtures from "../helpers/readFixtures";
import parse from "../../src/exec/parse";
import {
    execError,
    update,
    testPass,
    testFail,
    testFailWithRollback,
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
});

describe("batchUpdate()", () => {
    describe("when the given updateTasks array is empty", () => {
        test("should resolve immediately with true without emitting events", async () => {
            const updtr = new FakeUpdtr();

            expect(await batchUpdate(updtr, [])).toBe(true);
            expect(updtr.exec.args).toEqual([]);
            expect(updtr.emit.args).toEqual([]);
        });
    });
    describe("when the given updateTasks array contains one update task", () => {
        describe("when the tests succeed", () => {
            test("should return true and execute expected commands and emit expected events", async () => {
                const updtr = new FakeUpdtr();
                const updateTasks = createUpdateTasks(updtr.config);

                updateTasks.length = 1;
                updtr.execResults = update.concat(testPass);

                const success = await batchUpdate(updtr, updateTasks);

                expect(success).toBe(true);
                expect(updtr.exec.args).toMatchSnapshot(
                    "one update task > test ok > exec args"
                );
                expect(updtr.emit.args).toMatchSnapshot(
                    "one update task > test ok > emit args"
                );
            });
        });
        describe("when the test fails", () => {
            test("should return false and execute expected commands and emit expected events", async () => {
                const updtr = new FakeUpdtr();
                const updateTasks = createUpdateTasks(updtr.config);

                updateTasks.length = 1;
                updtr.execResults = update.concat(testFail);

                const success = await batchUpdate(updtr, updateTasks);

                expect(success).toBe(false);
                expect(updtr.exec.args).toMatchSnapshot(
                    "one update task > test fail > exec args"
                );
                expect(updtr.emit.args).toMatchSnapshot(
                    "one update task > test fail > emit args"
                );
            });
        });
    });
    describe("when the given updateTasks array contains multiple update tasks", () => {
        describe("using npm", () => {
            describe("when the tests succeed", () => {
                test("should return true and execute expected commands and emit expected events", async () => {
                    const updtr = new FakeUpdtr();
                    const updateTasks = createUpdateTasks(updtr.config);

                    updtr.execResults = update.concat(testPass);

                    const success = await batchUpdate(updtr, updateTasks);

                    expect(success).toBe(true);
                    expect(updtr.exec.args).toMatchSnapshot(
                        "multiple update tasks > npm > test ok > exec args"
                    );
                    expect(updtr.emit.args).toMatchSnapshot(
                        "multiple update tasks > npm > test ok > emit args"
                    );
                });
            });
            describe("when the test fails", () => {
                test("should return false and execute expected commands and emit expected events", async () => {
                    const updtr = new FakeUpdtr();
                    const updateTasks = createUpdateTasks(updtr.config);

                    updtr.execResults = update.concat(testFailWithRollback);

                    const success = await batchUpdate(updtr, updateTasks);

                    expect(success).toBe(false);
                    expect(updtr.exec.args).toMatchSnapshot(
                        "multiple update tasks > npm > test fail > exec args"
                    );
                    expect(updtr.emit.args).toMatchSnapshot(
                        "multiple update tasks > npm > test fail > emit args"
                    );
                });
            });
        });
        describe("using yarn", () => {
            describe("when the tests succeed", () => {
                test("should return true and execute expected commands and emit expected events", async () => {
                    const updtr = new FakeUpdtr({
                        use: "yarn",
                    });
                    const updateTasks = createUpdateTasks(updtr.config);

                    updtr.execResults = update.concat(testPass);

                    const success = await batchUpdate(updtr, updateTasks);

                    expect(success).toBe(true);
                    expect(updtr.exec.args).toMatchSnapshot(
                        "multiple update tasks > yarn > test ok > exec args"
                    );
                    expect(updtr.emit.args).toMatchSnapshot(
                        "multiple update tasks > yarn > test ok > emit args"
                    );
                });
            });
            describe("when the test fails", () => {
                test("should return false and execute expected commands and emit expected events", async () => {
                    const updtr = new FakeUpdtr({
                        use: "yarn",
                    });
                    const updateTasks = createUpdateTasks(updtr.config);

                    updtr.execResults = update.concat(testFailWithRollback);

                    const success = await batchUpdate(updtr, updateTasks);

                    expect(success).toBe(false);
                    expect(updtr.exec.args).toMatchSnapshot(
                        "multiple update tasks > yarn > test ok > exec args"
                    );
                    expect(updtr.emit.args).toMatchSnapshot(
                        "multiple update tasks > yarn > test fail > emit args"
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
                await batchUpdate(updtr, updateTasks);
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
                await batchUpdate(updtr, updateTasks);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toBe(execError);
            // emitted events: start, updating, testing, rollback
            expect(updtr.emit.args.length).toBe(4);
        });
    });
});
