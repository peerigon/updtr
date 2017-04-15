import { USE_YARN } from "../../src/constants/config";
import finish from "../../src/tasks/finish";
import FakeUpdtr from "../helpers/FakeUpdtr";
import {
    execError,
    npmList,
    yarnList,
    errorExecList,
} from "../fixtures/execResults";
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
    describe("unexpected errors", () => {
        test("should bail out completely", async () => {
            const updtr = new FakeUpdtr();
            const results = [module1ToNonBreakingSuccess];
            let givenErr;

            updtr.execResults = errorExecList;

            try {
                await finish(updtr, results);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toBe(execError);
        });
    });
});
