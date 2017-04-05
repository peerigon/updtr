import run from "../src/run";
import FakeUpdtr from "./helpers/FakeUpdtr";
import pickEventNames from "./helpers/pickEventNames";
import {
    execResultsReady,
    execError,
    npmNoOutdated,
    npmOutdated,
    updateTestPass,
} from "./fixtures/execResults";

beforeAll(() => execResultsReady);

describe("run()", () => {
    test("should emit a start event of expected shape", async () => {
        const updtr = new FakeUpdtr();

        updtr.execResults = npmNoOutdated;

        await run(updtr);

        expect(updtr.emittedEvents.shift()).toMatchSnapshot();
    });
    describe("when there are no outdated dependencies", () => {
        test("should emit init sequence events", async () => {
            const updtr = new FakeUpdtr();
            const eventNames = ["init/start", "init/end"];

            updtr.execResults = npmNoOutdated;

            await run(updtr);

            expect(pickEventNames(eventNames, updtr.emittedEvents)).toEqual(
                eventNames
            );
        });
        test("should not emit sequentialUpdate events", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmNoOutdated;

            await run(updtr);

            expect(
                pickEventNames(["sequential-update/start"], updtr.emittedEvents)
            ).toEqual([]);
        });
        test("should emit an end event of expected shape", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmNoOutdated;

            await run(updtr);

            expect(updtr.emittedEvents.pop()).toMatchSnapshot();
        });
    });
    describe("when there are outdated dependencies", () => {
        test("should emit sequentialUpdate events", async () => {
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

            expect(pickEventNames(eventNames, updtr.emittedEvents)).toEqual(
                eventNames
            );
        });
        test("should emit an end event of expected shape", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated.concat(
                updateTestPass,
                updateTestPass
            );

            await run(updtr);

            expect(updtr.emittedEvents.pop()).toMatchSnapshot();
        });
    });
});
