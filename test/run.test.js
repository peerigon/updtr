import run from "../src/run";
import FakeUpdtr from "./helpers/FakeUpdtr";
import {
    execResultsReady,
    execError,
    npmNoOutdated,
    npmOutdated,
} from "./fixtures/execResults";

function hasSequenceStartAndEndEvent(events, sequenceName) {
    const startEventName = sequenceName + "/start";
    const endEventName = sequenceName + "/end";
    const startAndEventEvents = events
        .filter(
        ([eventName]) =>
                eventName === startEventName || eventName === endEventName
        )
        .map(([eventName]) => eventName);

    expect(startAndEventEvents).toEqual([startEventName, endEventName]);
}

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

            updtr.execResults = npmNoOutdated;

            await run(updtr);

            hasSequenceStartAndEndEvent(updtr.emittedEvents, "init");
        });
        test("should not emit sequentialUpdate events", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmNoOutdated;

            await run(updtr);

            expect(() =>
                hasSequenceStartAndEndEvent(
                    updtr.emittedEvents,
                    "sequentialUpdate"
                )).toThrow();
        });
        test("should emit an end event of expected shape", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmNoOutdated;

            await run(updtr);

            expect(updtr.emittedEvents.pop()).toMatchSnapshot();
        });
    });
});
