import sequentialUpdate from "../../src/tasks/sequentialUpdate";
import FakeUpdtr from "../helpers/FakeUpdtr";
import createUpdateTask from "../../src/tasks/util/createUpdateTask";
import createUpdateResult from "../../src/tasks/util/createUpdateResult";
import readFixtures from "../helpers/readFixtures";
import parse from "../../src/exec/parse";
import pickEvents from "../helpers/pickEvents";
import {
    execError,
    update,
    testPass,
    testFailWithRollback,
    errorExecUpdate,
    errorExecRollback,
} from "../fixtures/execResults";

let stdoutLogs;

function createUpdateTasks(updtrConfig) {
    const packageManager = updtrConfig.use;
    const outdated = parse[packageManager].outdated(
        stdoutLogs.get(`outdated/outdated.${packageManager}.log`)
    );

    return outdated.map(outdated => createUpdateTask(outdated, updtrConfig));
}

beforeAll(async () => {
    stdoutLogs = await readFixtures([
        "outdated/outdated.npm.log",
        "outdated/outdated.yarn.log",
    ]);
});

describe("sequentialUpdate()", () => {
    describe("when the given updateTasks array is empty", () => {
        it("should resolve immediately with an empty array without emitting events", async () => {
            const updtr = new FakeUpdtr();

            expect(await sequentialUpdate(updtr, [])).toEqual([]);
            expect(updtr.exec.args).toEqual([]);
            expect(updtr.emit.args).toEqual([]);
        });
    });
    describe("when the given updateTasks array contains update tasks", () => {
        describe("using npm", () => {
            describe("when the tests succeed", () => {
                it("should return the expected update results", async () => {
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
                it("should emit expected events and execute expected commands", async () => {
                    const updtr = new FakeUpdtr();
                    const updateTasks = createUpdateTasks(updtr.config);

                    updtr.execResults = update.concat(
                        testFailWithRollback,
                        testPass
                    );

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
                it("should return the expected update results", async () => {
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
                it("should emit expected events and execute expected commands", async () => {
                    const updtr = new FakeUpdtr({
                        use: "yarn",
                    });
                    const updateTasks = createUpdateTasks(updtr.config);

                    updtr.execResults = update.concat(
                        testFailWithRollback,
                        testPass
                    );

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
    describe("when there is a previous update result", () => {
        it("should skip the first updating step if the previous update success was false", async () => {
            const updtr = new FakeUpdtr();
            const updateTasks = createUpdateTasks(updtr.config);
            const previousUpdateResult = createUpdateResult(
                updateTasks[0],
                false
            );

            updtr.execResults = testPass.concat(update, testPass);
            await sequentialUpdate(updtr, updateTasks, previousUpdateResult);

            expect(
                // first one is sequence start
                updtr.emit.secondCall.calledWith("sequential-update/testing")
            ).toBe(true);
            expect(
                pickEvents("sequential-update/updating", updtr.emit.args)
            ).toHaveLength(1);
        });
        it("should not skip the first updating step if the previous update success was true", async () => {
            const updtr = new FakeUpdtr();
            const updateTasks = createUpdateTasks(updtr.config);
            const previousUpdateResult = createUpdateResult(
                updateTasks[0],
                true
            );

            updtr.execResults = update.concat(testPass, update, testPass);
            await sequentialUpdate(updtr, updateTasks, previousUpdateResult);

            expect(
                // first one is sequence start
                updtr.emit.secondCall.calledWith("sequential-update/updating")
            ).toBe(true);
            expect(
                pickEvents("sequential-update/updating", updtr.emit.args)
            ).toHaveLength(2);
        });
        it("should not include the previous update result in the returned results", async () => {
            const updtr = new FakeUpdtr();
            const updateTasks = createUpdateTasks(updtr.config);
            const previousUpdateResult = createUpdateResult(
                updateTasks[0],
                false
            );

            updtr.execResults = testPass.concat(update, testPass);
            const results = await sequentialUpdate(
                updtr,
                updateTasks,
                previousUpdateResult
            );

            expect(results).toHaveLength(updateTasks.length);
        });
    });
    describe("unexpected errors", () => {
        it("should completely bail out if the update cmd exits with a non-zero exit code", async () => {
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
            expect(updtr.emit.args).toHaveLength(2);
        });
        it("should completely bail out if the rollback cmd exits with a non-zero exit code", async () => {
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
            // emitted events: start, updating, testing, rollback
            expect(updtr.emit.args).toHaveLength(4);
        });
    });
});
