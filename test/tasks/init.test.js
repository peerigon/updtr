import init from "../../src/tasks/init";
import readFixtures from "../helpers/readFixtures";
import FakeUpdtr from "../helpers/FakeUpdtr";
import ExecError from "../helpers/ExecError";

let stdoutLogs;

beforeAll(async () => {
    stdoutLogs = await readFixtures([
        "no-outdated/outdated.npm.log",
        "no-outdated/outdated.yarn.log",
        "outdated/outdated.npm.log",
        "outdated/outdated.yarn.log",
    ]);
});

describe("init()", () => {
    describe("when there are no outdated dependencies", () => {
        test("should emit expected events and execute expected commands", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = [
                Promise.resolve({ stdout: "" }), // installMissing
                Promise.resolve({
                    stdout: stdoutLogs.get("no-outdated/outdated.npm.log"),
                }), // outdated
            ];

            await init(updtr);

            expect(updtr.execArgs).toMatchSnapshot();
            expect(updtr.emittedEvents).toMatchSnapshot();
        });
        test("should return an empty array", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = [
                Promise.resolve({ stdout: "" }), // installMissing
                Promise.resolve({
                    stdout: stdoutLogs.get("no-outdated/outdated.npm.log"),
                }), // outdated
            ];

            const updateTasks = await init(updtr);

            expect(updateTasks.length).toBe(0);
        });
    });
    describe("when there are outdated dependencies", () => {
        describe("using npm", () => {
            test("should emit expected events and execute expected commands", async () => {
                const updtr = new FakeUpdtr();

                updtr.execResults = [
                    Promise.resolve({ stdout: "" }), // installMissing
                    // npm exits with exit code 1 when there are outdated dependencies
                    Promise.reject(
                        new ExecError({
                            stdout: stdoutLogs.get("outdated/outdated.npm.log"),
                            exitCode: 1,
                        })
                    ), // outdated
                ];

                await init(updtr);

                expect(updtr.execArgs).toMatchSnapshot();
                expect(updtr.emittedEvents).toMatchSnapshot();
            });
            test("should return an array of update tasks", async () => {
                const updtr = new FakeUpdtr();

                updtr.execResults = [
                    Promise.resolve({ stdout: "" }), // installMissing
                    // npm exits with exit code 1 when there are outdated dependencies
                    Promise.reject(
                        new ExecError({
                            stdout: stdoutLogs.get("outdated/outdated.npm.log"),
                            exitCode: 1,
                        })
                    ), // outdated
                ];

                // We already check the shape of the emitted update tasks so let's just
                // check if the returned tasks are the same as the emitted ones.
                const returnedUpdateTasks = await init(updtr);
                const [name, endEvent] = updtr.emittedEvents.pop();

                expect(name).toBe("init/end"); // Sanity check
                expect(returnedUpdateTasks).toBe(endEvent.updateTasks);
            });
        });
        describe("using yarn", () => {
            test("should emit expected events and execute expected commands", async () => {
                const updtr = new FakeUpdtr({
                    use: "yarn",
                });

                updtr.execResults = [
                    Promise.resolve({ stdout: "" }), // installMissing
                    // npm exits with exit code 1 when there are outdated dependencies
                    Promise.resolve({
                        stdout: stdoutLogs.get("outdated/outdated.yarn.log"),
                    }), // outdated
                ];

                await init(updtr);

                expect(updtr.execArgs).toMatchSnapshot();
                expect(updtr.emittedEvents).toMatchSnapshot();
            });
            // We don't test for everything here because we assume that the rest works the same as with npm
        });
    });
    describe("when there are excluded dependencies", () => {
        test("should emit expected events and execute expected commands", async () => {
            const updtr = new FakeUpdtr({
                exclude: ["updtr-test-module-1", "updtr-test-module-2"],
            });

            updtr.execResults = [
                Promise.resolve({ stdout: "" }), // installMissing
                Promise.resolve({
                    stdout: stdoutLogs.get("no-outdated/outdated.npm.log"),
                }), // outdated
            ];

            await init(updtr);

            expect(updtr.execArgs).toMatchSnapshot();
            expect(updtr.emittedEvents).toMatchSnapshot();
        });
    });
    describe("unexpected errors", () => {
        test("should fail when installMissing cmd exits with a non-zero exit code", async () => {
            const execErr = new ExecError({ message: "Oops", exitCode: 1 });
            const updtr = new FakeUpdtr();
            let givenErr;

            updtr.execResults = [
                Promise.reject(execErr), // installMissing
            ];

            try {
                await init(updtr);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toBe(execErr);
        });
        test("should fail when the outdated cmd exits with an exit code above 1", async () => {
            const execErr = new ExecError({ message: "Oops", exitCode: 2 });
            const updtr = new FakeUpdtr();
            let givenErr;

            updtr.execResults = [
                Promise.resolve({ stdout: "" }), // installMissing
                Promise.reject(execErr), // installMissing
            ];

            try {
                await init(updtr);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toBe(execErr);
        });
        test("should fail with a parse error when the stdout could not be parsed", async () => {
            const updtr = new FakeUpdtr();
            let givenErr;

            updtr.execResults = [
                Promise.resolve({ stdout: "" }), // installMissing
                Promise.resolve({ stdout: "Nonsense" }), // outdated
            ];

            try {
                await init(updtr);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toBeInstanceOf(SyntaxError);
            expect(givenErr.message).toBe(
                "Error when trying to parse stdout from command 'npm outdated --json --long --depth=0': Unexpected token N in JSON at position 0"
            );
        });
    });
});
