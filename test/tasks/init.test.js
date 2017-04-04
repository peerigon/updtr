import init from "../../src/tasks/init";
import Instance from "../../src/state/Instance";
import readFixtures from "../helpers/readFixtures";

const instanceBaseConfig = {
    cwd: __dirname,
};
let stdoutLogs;

class FakeInstance extends Instance {
    constructor(execResults) {
        super({ ...instanceBaseConfig });
        this.execArgs = [];
        this.execResults = execResults;
        this.emittedEvents = [];
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
            const instance = new FakeInstance([
                Promise.resolve({ stdout: "" }), // installMissing
                Promise.resolve({
                    stdout: stdoutLogs.get("no-outdated/outdated.npm.log"),
                }), // outdated
            ]);

            await init(instance);

            expect(instance.execArgs).toMatchSnapshot();
            expect(instance.emittedEvents).toMatchSnapshot();
        });
    });
    describe("when there are outdated dependencies", () => {
        test("should emit expected events and execute expected commands", async () => {
            const instance = new FakeInstance([
                Promise.resolve({ stdout: "" }), // installMissing
                Promise.resolve({
                    stdout: stdoutLogs.get("outdated/outdated.npm.log"),
                }), // outdated
            ]);

            await init(instance);

            expect(instance.execArgs).toMatchSnapshot();
            expect(instance.emittedEvents).toMatchSnapshot();
        });
    });
});
