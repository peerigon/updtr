import sequentialUpdate from "../../src/tasks/sequentialUpdate";
import FakeUpdtr from "../helpers/FakeUpdtr";
import createUpdateTask from "../../src/tasks/util/createUpdateTask";
import readFixtures from "../helpers/readFixtures";
import parse from "../../src/exec/parse";
import ExecError from "../helpers/ExecError";

let stdoutLogs;

function createUpdateTasks(updtrConfig) {
    const packageManager = updtrConfig.packageManager;
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

describe("sequentialUpdate()", () => {
    describe("when the given updateTasks array is empty", () => {
        test("should resolve immediately without emitting events", async () => {
            const updtr = new FakeUpdtr();

            await sequentialUpdate(updtr, []);

            expect(updtr.execArgs).toMatchSnapshot();
            expect(updtr.emittedEvents).toMatchSnapshot();
        });
    });
    describe("when the given updateTasks array contains update tasks", () => {
        describe("using npm", () => {
            describe("when the tests succeed", () => {
                test("should return the expected update results", async () => {
                    const updtr = new FakeUpdtr();
                    const updateTasks = createUpdateTasks(updtr.config);

                    updtr.execResults = [
                        Promise.resolve({ stdout: "" }), // update
                        Promise.resolve({ stdout: "Everything ok" }), // test
                        Promise.resolve({ stdout: "" }), // update
                        Promise.resolve({ stdout: "Everything ok" }), // testing
                    ];

                    const updateResults = await sequentialUpdate(
                        updtr,
                        updateTasks
                    );

                    expect(updateResults).toMatchSnapshot(
                        "updateResults success"
                    );
                    // Additional sanity check since comparing version numbers in the snapshot can be error prone
                    expect(updateResults[0].version).toBe(
                        updateTasks[0].updateTo
                    );
                    expect(updateResults[1].version).toBe(
                        updateTasks[1].updateTo
                    );
                });
            });
            describe("when the first test fails and the rest succeeds", () => {
                test("should emit expected events and execute expected commands", async () => {
                    const execErr = new ExecError({
                        stdout: "Oh noez",
                        exitCode: 1,
                    });
                    const updtr = new FakeUpdtr();
                    const updateTasks = createUpdateTasks(updtr.config);

                    updtr.execResults = [
                        Promise.resolve({ stdout: "" }), // update
                        Promise.reject(execErr), // test
                        Promise.resolve({ stdout: "" }), // rollback
                        Promise.resolve({ stdout: "" }), // update
                        Promise.resolve({ stdout: "Everything ok" }), // testing
                    ];

                    const updateResults = await sequentialUpdate(
                        updtr,
                        updateTasks
                    );

                    expect(updtr.execArgs).toMatchSnapshot("execArgs npm");
                    expect(updtr.emittedEvents).toMatchSnapshot(
                        "emittedEvents npm"
                    );
                    expect(updateResults).toMatchSnapshot(
                        "updateResults one fail"
                    );
                    // Additional sanity check since comparing version numbers in the snapshot can be error prone
                    expect(updateResults[0].version).toBe(
                        updateTasks[0].rollbackTo
                    );
                    expect(updateResults[1].version).toBe(
                        updateTasks[1].updateTo
                    );
                });
            });
        });
        describe("using yarn", () => {
            describe("when the tests succeed", () => {
                test("should return the expected update results", async () => {
                    const updtr = new FakeUpdtr({
                        packageManager: "yarn",
                    });
                    const updateTasks = createUpdateTasks(updtr.config);

                    updtr.execResults = [
                        Promise.resolve({ stdout: "" }), // update
                        Promise.resolve({ stdout: "Everything ok" }), // test
                        Promise.resolve({ stdout: "" }), // update
                        Promise.resolve({ stdout: "Everything ok" }), // testing
                    ];

                    const updateResults = await sequentialUpdate(
                        updtr,
                        updateTasks
                    );

                    expect(updateResults).toMatchSnapshot(
                        "updateResults success"
                    );
                    // Additional sanity check since comparing version numbers in the snapshot can be error prone
                    expect(updateResults[0].version).toBe(
                        updateTasks[0].updateTo
                    );
                    expect(updateResults[1].version).toBe(
                        updateTasks[1].updateTo
                    );
                });
            });
            describe("when the first test fails and the rest succeeds", () => {
                test("should emit expected events and execute expected commands", async () => {
                    const execErr = new ExecError({
                        stdout: "Oh noez",
                        exitCode: 1,
                    });
                    const updtr = new FakeUpdtr({
                        packageManager: "yarn",
                    });
                    const updateTasks = createUpdateTasks(updtr.config);

                    updtr.execResults = [
                        Promise.resolve({ stdout: "" }), // update
                        Promise.reject(execErr), // test
                        Promise.resolve({ stdout: "" }), // rollback
                        Promise.resolve({ stdout: "" }), // update
                        Promise.resolve({ stdout: "Everything ok" }), // testing
                    ];

                    const updateResults = await sequentialUpdate(
                        updtr,
                        updateTasks
                    );

                    expect(updtr.execArgs).toMatchSnapshot("execArgs yarn");
                    expect(updtr.emittedEvents).toMatchSnapshot(
                        "emittedEvents yarn"
                    );
                    expect(updateResults).toMatchSnapshot(
                        "updateResults one fail rest pass"
                    );
                    // Additional sanity check since comparing version numbers in the snapshot can be error prone
                    expect(updateResults[0].version).toBe(
                        updateTasks[0].rollbackTo
                    );
                    expect(updateResults[1].version).toBe(
                        updateTasks[1].updateTo
                    );
                });
            });
        });
    });
    describe("unexpected errors", () => {
        test("should completely bail out if the update cmd exits with a non-zero exit code", async () => {
            const updtr = new FakeUpdtr();
            const updateTasks = createUpdateTasks(updtr.config);
            const execErr = new ExecError({
                exitCode: 1,
                stderr: "Something bad happened",
            });
            let givenErr;

            updtr.execResults = [
                Promise.reject(execErr), // update
            ];

            try {
                await sequentialUpdate(updtr, updateTasks);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toBe(execErr);
            // emitted events: start, updating
            expect(updtr.emittedEvents.length).toBe(2);
        });
        test("should completely bail out if the rollback cmd exits with a non-zero exit code", async () => {
            const updtr = new FakeUpdtr();
            const updateTasks = createUpdateTasks(updtr.config);
            const execErr = new ExecError({
                exitCode: 1,
                stderr: "Something bad happened",
            });
            let givenErr;

            updtr.execResults = [
                Promise.resolve({ stdout: "" }), // update
                Promise.resolve({ stdout: "Everything ok" }), // test
                Promise.reject(execErr), // rollback
            ];

            try {
                await sequentialUpdate(updtr, updateTasks);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toBe(execErr);
            // emitted events: start, updating, testing, testResult, rollback
            expect(updtr.emittedEvents.length).toBe(5);
        });
    });
});
