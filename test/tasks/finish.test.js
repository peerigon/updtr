import { USE_YARN } from "../../src/constants/config";
import finish from "../../src/tasks/finish";
import FakeUpdtr from "../helpers/FakeUpdtr";
import { npmList, yarnList } from "../fixtures/execResults";
import {
    module1ToLatestSuccess,
    module1ToNonBreakingSuccess,
    module2ToLatestSuccess,
    module2ToNonBreakingSuccess,
    module1ToLatestFail,
    module1ToNonBreakingFail,
    module2ToLatestFail,
    module2ToNonBreakingFail,
} from "../fixtures/updateResults";

describe("finish()", () => {
    describe("when the given results array is empty", () => {
        test("should resolve immediately with an empty array without emitting events", async () => {
            const updtr = new FakeUpdtr();

            expect(await finish(updtr, [])).toEqual([]);
            expect(updtr.exec.args).toEqual([]);
            expect(updtr.emit.args).toEqual([]);
        });
    });
    describe("when the given results are complete", () => {
        test("should resolve immediately with the given results without emitting events", async () => {
            const updtr = new FakeUpdtr();
            const results = [
                module1ToLatestSuccess,
                module1ToLatestFail,
                module1ToNonBreakingFail,
                module2ToLatestSuccess,
                module2ToLatestFail,
                module2ToNonBreakingFail,
            ];

            expect(await finish(updtr, results)).toEqual(results);
            expect(updtr.exec.args).toEqual([]);
            expect(updtr.emit.args).toEqual([]);
        });
    });
    describe("when there are incomplete results", () => {
        describe("using npm", () => {
            test("should return the expected results and emit the expected events", async () => {
                const updtr = new FakeUpdtr();
                const results = [
                    module1ToLatestSuccess,
                    module1ToNonBreakingSuccess,
                    module2ToLatestSuccess,
                    module2ToNonBreakingSuccess,
                ];

                updtr.execResults = npmList;

                expect(await finish(updtr, results)).toMatchSnapshot(
                    "incomplete > npm > results"
                );
                expect(updtr.exec.args).toMatchSnapshot(
                    "incomplete > npm > exec args"
                );
                expect(updtr.emit.args).toMatchSnapshot(
                    "incomplete > npm > emit args"
                );
            });
        });
        describe("using yarn", () => {
            test("should return the expected results and emit the expected events", async () => {
                const updtr = new FakeUpdtr({
                    use: USE_YARN,
                });
                const results = [
                    module1ToLatestSuccess,
                    module1ToNonBreakingSuccess,
                    module2ToLatestSuccess,
                    module2ToNonBreakingSuccess,
                ];

                updtr.execResults = yarnList;

                expect(await finish(updtr, results)).toMatchSnapshot(
                    "incomplete > yarn > results"
                );
                expect(updtr.exec.args).toMatchSnapshot(
                    "incomplete > yarn > exec args"
                );
                expect(updtr.emit.args).toMatchSnapshot(
                    "incomplete > yarn > emit args"
                );
            });
        });
    });

    //     return;
    //     describe("using npm", () => {
    //         describe("when the tests succeed", () => {
    //             test("should return the expected update results", async () => {
    //                 const updtr = new FakeUpdtr();
    //                 const updateTasks = createUpdateTasks(updtr.config);

    //                 updtr.execResults = update.concat(testPass);

    //                 const success = await batchUpdate(updtr, updateTasks);

    //                 expect(success).toBe(true);
    //             });
    //         });
    //         describe("when the test fails", () => {
    //             test("should emit expected events and execute expected commands", async () => {
    //                 const updtr = new FakeUpdtr();
    //                 const updateTasks = createUpdateTasks(updtr.config);

    //                 updtr.execResults = update.concat(testFail);

    //                 const success = await batchUpdate(updtr, updateTasks);

    //                 expect(updtr.exec.args).toMatchSnapshot();
    //                 expect(updtr.emit.args).toMatchSnapshot();
    //                 expect(success).toBe(false);
    //             });
    //         });
    //     });
    //     describe("using yarn", () => {
    //         describe("when the tests succeed", () => {
    //             test("should return the expected update results", async () => {
    //                 const updtr = new FakeUpdtr({
    //                     use: "yarn",
    //                 });
    //                 const updateTasks = createUpdateTasks(updtr.config);

    //                 updtr.execResults = update.concat(testPass);

    //                 const success = await batchUpdate(updtr, updateTasks);

    //                 expect(success).toBe(true);
    //             });
    //         });
    //         describe("when the test fails", () => {
    //             test("should emit expected events and execute expected commands", async () => {
    //                 const updtr = new FakeUpdtr({
    //                     use: "yarn",
    //                 });
    //                 const updateTasks = createUpdateTasks(updtr.config);

    //                 updtr.execResults = update.concat(testFail);

    //                 const success = await batchUpdate(updtr, updateTasks);

    //                 expect(updtr.exec.args).toMatchSnapshot();
    //                 expect(updtr.emit.args).toMatchSnapshot();
    //                 expect(success).toBe(false);
    //             });
    //         });
    //     });
    // });

    // describe("unexpected errors", () => {
    //     test("should completely bail out if the update cmd exits with a non-zero exit code", async () => {
    //         const updtr = new FakeUpdtr();
    //         const updateTasks = createUpdateTasks(updtr.config);
    //         let givenErr;

    //         updtr.execResults = errorExecUpdate;

    //         try {
    //             await batchUpdate(updtr, updateTasks);
    //         } catch (err) {
    //             givenErr = err;
    //         }

    //         expect(givenErr).toBe(execError);
    //         // emitted events: start, updating
    //         expect(updtr.emit.args.length).toBe(2);
    //     });
    //     test("should completely bail out if the rollback cmd exits with a non-zero exit code", async () => {
    //         const updtr = new FakeUpdtr();
    //         const updateTasks = createUpdateTasks(updtr.config);
    //         let givenErr;

    //         updtr.execResults = errorExecRollback;

    //         try {
    //             await batchUpdate(updtr, updateTasks);
    //         } catch (err) {
    //             givenErr = err;
    //         }

    //         expect(givenErr).toBe(execError);
    //         // emitted events: start, updating, testing, testResult, rollback
    //         expect(updtr.emit.args.length).toBe(5);
    //     });
    // });
});
