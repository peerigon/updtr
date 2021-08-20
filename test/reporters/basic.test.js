import EventEmitter from "events";
import unicons from "unicons";
import {stub} from "sinon";
import basic from "../../src/reporters/basic";
import events from "../fixtures/events";

let consoleStub;

function setup(reporterConfig = {}) {
    const updtr = new EventEmitter();
    const output = [];

    consoleStub.callsFake((...args) => output.push(args));
    basic(updtr, reporterConfig);

    return {
        updtr,
        output,
    };
}

beforeAll(() => {
    // We need to replace platform-dependent characters with static counter parts to make snapshot testing
    // consistent across platforms.
    unicons.cli = sign => {
        switch (sign) {
            case "circle":
                return "-";
            default:
                return "";
        }
    };
    consoleStub = stub(console, "log");
});

afterEach(() => {
    consoleStub.reset();
});

afterAll(() => {
    consoleStub.restore();
});

describe("basic()", () => {
    Object.keys(events).forEach(caseName => {
        describe(caseName, () => {
            it("should print the expected lines", async () => {
                const testCase = events[caseName];
                const {updtr, output} = setup(testCase.reporterConfig);

                await testCase.events.reduce(async (previous, [
                    eventName,
                    event,
                ]) => {
                    await previous;
                    updtr.emit(eventName, event);

                    // Faking async events
                    return Promise.resolve();
                }, Promise.resolve());

                expect(
                    output.join("\n").replace(
                        // We need to replace the timing because that is non-deterministic
                        /Finished after \d+\.\ds/,
                        "Finished after 1.0s"
                    )
                ).toMatchSnapshot(caseName);
            });
        });
    });
});
