import init from "../../src/tasks/init";
import Updtr from "../../src/Updtr";
import readFixtures from "../helpers/readFixtures";

const baseUpdtrConfig = {
    cwd: __dirname,
};
let stdoutLogs;

class ExecError extends Error {
    constructor({ message, stdout, stderr, exitCode }) {
        super(message);
        this.stdout = stdout;
        this.stderr = stderr;
        this.code = exitCode;
    }
}

class FakeUpdtr extends Updtr {
    constructor(execResults, updtrConfig = { ...baseUpdtrConfig }) {
        super(updtrConfig);
        this.emittedEvents = [];
        this.execArgs = [];
        this.execResults = execResults;
    }
    exec(...args) {
        this.execArgs.push(args);

        return this.execResults.shift();
    }
    emit(...args) {
        this.emittedEvents.push(args);
    }
}

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
            const execResults = [
                Promise.resolve({ stdout: "" }), // installMissing
                Promise.resolve({
                    stdout: stdoutLogs.get("no-outdated/outdated.npm.log"),
                }), // outdated
            ];
            const updtr = new FakeUpdtr(execResults);

            await init(updtr);

            expect(updtr.execArgs).toMatchSnapshot();
            expect(updtr.emittedEvents).toMatchSnapshot();
        });
    });
    describe("when there are outdated dependencies", () => {
        describe("using npm", () => {
            test("should emit expected events and execute expected commands", async () => {
                const execResults = [
                    Promise.resolve({ stdout: "" }), // installMissing
                    // npm exits with exit code 1 when there are outdated dependencies
                    Promise.reject(
                        new ExecError({
                            stdout: stdoutLogs.get("outdated/outdated.npm.log"),
                            exitCode: 1,
                        })
                    ), // outdated
                ];
                const updtr = new FakeUpdtr(execResults);

                await init(updtr);

                expect(updtr.execArgs).toMatchSnapshot();
                expect(updtr.emittedEvents).toMatchSnapshot();
            });
        });
        describe("using yarn", () => {
            test("should emit expected events and execute expected commands", async () => {
                const execResults = [
                    Promise.resolve({ stdout: "" }), // installMissing
                    // npm exits with exit code 1 when there are outdated dependencies
                    Promise.resolve({
                        stdout: stdoutLogs.get("outdated/outdated.yarn.log"),
                    }), // outdated
                ];
                const updtr = new FakeUpdtr(execResults, {
                    ...baseUpdtrConfig,
                    packageManager: "yarn",
                });

                await init(updtr);

                expect(updtr.execArgs).toMatchSnapshot();
                expect(updtr.emittedEvents).toMatchSnapshot();
            });
        });
    });
    describe("when there are excluded dependencies", () => {
        test("should emit expected events and execute expected commands", async () => {
            const execResults = [
                Promise.resolve({ stdout: "" }), // installMissing
                Promise.resolve({
                    stdout: stdoutLogs.get("no-outdated/outdated.npm.log"),
                }), // outdated
            ];
            const updtr = new FakeUpdtr(execResults, {
                ...baseUpdtrConfig,
                exclude: ["updtr-test-module-1", "updtr-test-module-2"],
            });

            await init(updtr);

            expect(updtr.execArgs).toMatchSnapshot();
            expect(updtr.emittedEvents).toMatchSnapshot();
        });
    });
    describe("unexpected errors", () => {
        test("should fail when installMissing cmd exits with a non-zero exit code", async () => {
            const execErr = new ExecError({ message: "Oops", exitCode: 1 });
            const execResults = [
                Promise.reject(execErr), // installMissing
            ];
            const updtr = new FakeUpdtr(execResults);
            let givenErr;

            try {
                await init(updtr);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toBe(execErr);
        });
        test("should fail when the outdated cmd exits with an exit code above 1", async () => {
            const execErr = new ExecError({ message: "Oops", exitCode: 2 });
            const execResults = [
                Promise.resolve({ stdout: "" }), // installMissing
                Promise.reject(execErr), // installMissing
            ];
            const updtr = new FakeUpdtr(execResults);
            let givenErr;

            try {
                await init(updtr);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toBe(execErr);
        });
        test("should fail with a parse error when the stdout could not be parsed", async () => {
            const execResults = [
                Promise.resolve({ stdout: "" }), // installMissing
                Promise.resolve({ stdout: "Nonsense" }), // outdated
            ];
            const updtr = new FakeUpdtr(execResults);
            let givenErr;

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
