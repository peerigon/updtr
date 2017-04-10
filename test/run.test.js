import clone from "clone";
import run from "../src/run";
import FakeUpdtr from "./helpers/FakeUpdtr";
import pickEventNames from "./helpers/pickEventNames";
import pickEvents from "./helpers/pickEvents";
import ExecError from "./helpers/ExecError";
import {
    ready as execResultsReady,
    npmNoOutdated,
    npmOutdated,
    updateTestPass,
    updateTestFail,
} from "./fixtures/execResults";

function npmOutdatedBatchUpdate() {
    return [
        { stdout: "" }, // installMissing
        // npm exits with exit code 1 when there are outdated dependencies
        new ExecError({
            stdout: JSON.stringify({
                "updtr-test-module-1": {
                    current: "1.0.0",
                    wanted: "1.1.1",
                    latest: "2.0.0",
                    location: "node_modules/updtr-test-module-1",
                },
                "updtr-test-module-2": {
                    current: "2.0.0",
                    wanted: "2.1.1",
                    latest: "2.1.1",
                    location: "node_modules/updtr-test-module-2",
                },
                "updtr-test-module-3": {
                    current: "2.0.0",
                    wanted: "2.1.1",
                    latest: "2.1.1",
                    location: "node_modules/updtr-test-module-3",
                },
            }),
            exitCode: 1,
        }), // outdated
    ];
}

beforeAll(() => execResultsReady);

describe("run()", () => {
    test("should emit a start event of expected shape", async () => {
        const updtr = new FakeUpdtr();

        updtr.execResults = npmNoOutdated;

        await run(updtr);

        expect(updtr.emit.args.shift()).toMatchSnapshot();
    });
    describe("when there are no outdated dependencies", () => {
        test("should emit init sequence events", async () => {
            const updtr = new FakeUpdtr();
            const eventNames = ["init/start", "init/end"];

            updtr.execResults = npmNoOutdated;

            await run(updtr);

            expect(pickEventNames(eventNames, updtr.emit.args)).toEqual(
                eventNames
            );
        });
        test("should not emit sequentialUpdate events", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmNoOutdated;

            await run(updtr);

            expect(
                pickEventNames(["sequential-update/start"], updtr.emit.args)
            ).toEqual([]);
        });
        test("should emit an end event of expected shape", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmNoOutdated;

            await run(updtr);

            expect(updtr.emit.args.pop()).toMatchSnapshot();
        });
    });
    describe("when there are outdated dependencies", () => {
        test("should execute the batch-update for non-breaking updates", async () => {
            const updtr = new FakeUpdtr();
            const eventNames = ["batch-update/start", "batch-update/end"];

            updtr.execResults = npmOutdated.concat(
                updateTestPass,
                updateTestPass
            );

            await run(updtr);

            const batchUpdateEvent = pickEvents(
                "batch-update/start",
                updtr.emit.args
            )[0];

            expect(pickEventNames(eventNames, updtr.emit.args)).toEqual(
                eventNames
            );
            expect(batchUpdateEvent.updateTasks).toMatchSnapshot();
        });
        test("should execute the sequential-update for breaking updates", async () => {
            const updtr = new FakeUpdtr();
            const eventNames = [
                "sequential-update/start",
                "sequential-update/end",
            ];

            updtr.execResults = npmOutdated.concat(
                updateTestPass,
                updateTestPass
            );

            await run(updtr);

            const sequentialUpdateEvent = pickEvents(
                "sequential-update/start",
                updtr.emit.args
            )[0];

            expect(pickEventNames(eventNames, updtr.emit.args)).toEqual(
                eventNames
            );
            expect(sequentialUpdateEvent.updateTasks).toMatchSnapshot();
        });
        test("should emit an end event of expected shape", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated.concat(
                updateTestPass,
                updateTestPass
            );

            await run(updtr);

            expect(updtr.emit.args.pop()).toMatchSnapshot();
        });
        describe("when the batch-update was executed with one dependency and the batch-update fails", () => {
            test("should run the sequential-update only for breaking dependencies", async () => {
                const updtr = new FakeUpdtr();

                updtr.execResults = npmOutdated.concat(
                    updateTestFail,
                    updateTestPass
                );

                await run(updtr);

                const sequentialUpdateEvent = pickEvents(
                    "sequential-update/start",
                    updtr.emit.args
                )[0];

                expect(sequentialUpdateEvent.updateTasks).toMatchSnapshot();
            });
            test("should emit an end event of expected shape", async () => {
                const updtr = new FakeUpdtr();

                updtr.execResults = npmOutdated.concat(
                    updateTestFail,
                    updateTestPass
                );

                await run(updtr);

                expect(updtr.emit.args.pop()).toMatchSnapshot();
            });
        });
        describe("when the batch-update was executed with more than one dependency and the batch-update fails", () => {
            test("should run the sequential-update for all dependencies", async () => {
                const updtr = new FakeUpdtr();

                updtr.execResults = npmOutdatedBatchUpdate().concat(
                    updateTestFail,
                    updateTestFail,
                    updateTestPass,
                    updateTestPass
                );

                await run(updtr);

                const sequentialUpdateEvent = pickEvents(
                    "sequential-update/start",
                    updtr.emit.args
                )[0];

                expect(sequentialUpdateEvent.updateTasks).toMatchSnapshot();
            });
            test("should emit an end event of expected shape", async () => {
                const updtr = new FakeUpdtr();

                updtr.execResults = npmOutdated.concat(
                    updateTestFail,
                    updateTestFail,
                    updateTestPass
                );

                await run(updtr);

                expect(updtr.emit.args.pop()).toMatchSnapshot();
            });
        });
    });
});
