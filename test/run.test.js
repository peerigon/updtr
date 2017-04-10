import run from "../src/run";
import FakeUpdtr from "./helpers/FakeUpdtr";
import pickEventNames from "./helpers/pickEventNames";
import {
    ready as execResultsReady,
    npmNoOutdated,
    npmOutdated,
    updateTestPass,
    updateTestFail,
} from "./fixtures/execResults";

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
        test("should emit batch-update events for non-breaking updates", async () => {
            const updtr = new FakeUpdtr();
            const eventNames = ["batch-update/start", "batch-update/end"];

            updtr.execResults = npmOutdated.concat(
                updateTestPass,
                updateTestPass
            );

            await run(updtr);

            const batchUpdateEvent = updtr.emit.args.find(
                ([eventName]) => eventName === "batch-update/start"
            )[1];

            expect(pickEventNames(eventNames, updtr.emit.args)).toEqual(
                eventNames
            );
            expect(batchUpdateEvent.updateTasks).toMatchSnapshot();
        });
        test("should emit sequential-update events for breaking updates", async () => {
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

            const sequentialUpdateEvent = updtr.emit.args.find(
                ([eventName]) => eventName === "sequential-update/start"
            )[1];

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
        describe("when the batch-update fails", () => {
            test("should run the sequential-update for all dependencies", async () => {
                const updtr = new FakeUpdtr();

                updtr.execResults = npmOutdated.concat(
                    updateTestFail,
                    updateTestFail,
                    updateTestPass
                );

                await run(updtr);

                const sequentialUpdateEvent = updtr.emit.args.find(
                    ([eventName]) => eventName === "sequential-update/start"
                )[1];

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
