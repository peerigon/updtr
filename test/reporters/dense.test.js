import EventEmitter from "events";
import { WritableStreamBuffer } from "stream-buffers";
import dense from "../../src/reporters/dense";
import Spinner from "../../src/reporters/util/Spinner";
import events from "../fixtures/events";

function setup(reporterConfig = {}) {
    const updtr = new EventEmitter();
    const stdout = new WritableStreamBuffer();

    reporterConfig.stream = stdout;
    dense(updtr, reporterConfig);

    return {
        updtr,
        stdout,
    };
}

beforeAll(() => {
    // We need to replace the spinner with a static string to make snapshot testing
    // consistent across platforms.
    Spinner.prototype.valueOf = () => "...";
});

describe("dense()", () => {
    Object.keys(events).forEach(caseName => {
        describe(caseName, () => {
            it("should print the expected lines", async () => {
                const testCase = events[caseName];
                const { updtr, stdout } = setup(testCase.reporterConfig);

                await testCase.events.reduce(async (previous, [
                    eventName,
                    event,
                ]) => {
                    await previous;
                    updtr.emit(eventName, event);

                    // Faking async events
                    return Promise.resolve();
                }, Promise.resolve());

                const output = stdout.getContentsAsString("utf8");

                expect(
                    output.replace(
                        // We need to replace the timing because that is non-deterministic
                        /Finished after \d\.\ds/,
                        "Finished after 1.0s"
                    )
                ).toMatchSnapshot(caseName);
            });
        });
    });
});
