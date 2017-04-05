import sequentialUpdate from "../../src/tasks/sequentialUpdate";
import FakeUpdtr from "../helpers/FakeUpdtr";
import createUpdateTask from "../../src/tasks/util/createUpdateTask";
import readFixtures from "../helpers/readFixtures";
import parse from "../../src/exec/parse";

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
            describe("when the wanted flag is not set", () => {
                describe("when the tests succeed", () => {
                    test("should emit expected events and execute expected commands", async () => {
                        const updtr = new FakeUpdtr({
                            wanted: false,
                        });
                        const updateTasks = createUpdateTasks(updtr.config);

                        updtr.execResults = [
                            Promise.resolve({ stdout: "" }), // update
                            Promise.resolve({ stdout: "Everything ok" }), // testing
                        ];

                        // Truncate the updateTasks for this test because we only want to test the sequence of one test
                        // Makes it easier to read the snapshot
                        updateTasks.length = 1;
                        await sequentialUpdate(updtr, updateTasks);

                        expect(updtr.execArgs).toMatchSnapshot();
                        expect(updtr.emittedEvents).toMatchSnapshot();
                    });
                });
            });
        });
    });
});

// const execResults = updateTasks.reduce(execResults => execResults.concat(
//                                 Promise.resolve({ stdout: "" }), // update
//                                 Promise.resolve({ stdout: "Everything ok" }), // testing
//                             ), []);
