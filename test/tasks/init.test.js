import init from "../../src/tasks/init";
import Instance from "../../src/state/Instance";
import readFixtures from "../helpers/readFixtures";

const baseInstanceConfig = {
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

class FakeInstance extends Instance {
    constructor(execResults, instanceConfig = { ...baseInstanceConfig }) {
        super(instanceConfig);
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
            const instance = new FakeInstance(execResults);

            await init(instance);

            expect(instance.execArgs).toMatchSnapshot();
            expect(instance.emittedEvents).toMatchSnapshot();
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
                const instance = new FakeInstance(execResults);

                await init(instance);

                expect(instance.execArgs).toMatchSnapshot();
                expect(instance.emittedEvents).toMatchSnapshot();
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
                const instance = new FakeInstance(execResults, {
                    ...baseInstanceConfig,
                    packageManager: "yarn",
                });

                await init(instance);

                expect(instance.execArgs).toMatchSnapshot();
                expect(instance.emittedEvents).toMatchSnapshot();
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
            const instance = new FakeInstance(execResults, {
                ...baseInstanceConfig,
                exclude: ["updtr-test-module-1", "updtr-test-module-2"],
            });

            await init(instance);

            expect(instance.execArgs).toMatchSnapshot();
            expect(instance.emittedEvents).toMatchSnapshot();
        });
    });
});
