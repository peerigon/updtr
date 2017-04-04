import Sequence from "../../../src/tasks/util/Sequence";
import Updtr from "../../../src/Updtr";

const baseEvent = {
    a: true,
    b: true,
};
const baseUpdtrConfig = {
    cwd: __dirname,
};

describe("new Sequence()", () => {
    describe(".updtr", () => {
        test("should be the given updtr", () => {
            const updtr = new Updtr(baseUpdtrConfig);
            const sequence = new Sequence("test", updtr, baseEvent);

            expect(sequence.updtr).toBe(updtr);
        });
    });
    describe(".baseEvent", () => {
        test("should be the given baseEvent", () => {
            const updtr = new Updtr(baseUpdtrConfig);
            const sequence = new Sequence("test", updtr, baseEvent);

            expect(sequence.baseEvent).toBe(baseEvent);
        });
    });
    describe(".emit()", () => {
        test("should emit an event on the updtr under the given namespace", () => {
            const updtr = new Updtr(baseUpdtrConfig);
            const sequence = new Sequence("test", updtr, baseEvent);
            let hasBeenCalled = false;

            updtr.on("test/test", () => {
                hasBeenCalled = true;
            });

            sequence.emit("test");

            expect(hasBeenCalled).toBe(true);
        });
        test("should not emit the base event itself but a copy of it when no event object is given", () => {
            const updtr = new Updtr(baseUpdtrConfig);
            const sequence = new Sequence("test", updtr, baseEvent);
            let givenEvent;

            updtr.on("test/test", event => {
                givenEvent = event;
            });

            sequence.emit("test");

            expect(givenEvent).not.toBe(baseEvent);
            expect(givenEvent).toEqual(baseEvent);
        });
        test("should emit an event on the updtr with the properties of the given base event", () => {
            const updtr = new Updtr(baseUpdtrConfig);
            const sequence = new Sequence("test", updtr, baseEvent);
            const event = { b: false, c: true };
            let givenEvent;

            updtr.on("test/test", event => {
                givenEvent = event;
            });

            sequence.emit("test", event);

            expect(givenEvent).toEqual({ ...baseEvent, ...event });
        });
    });
    describe(".exec()", () => {
        test("should emit an event on the updtr for each step with the given command", async () => {
            const updtr = new Updtr(baseUpdtrConfig);
            const sequence = new Sequence("test", updtr, baseEvent);
            const emittedEvents = [];

            function saveEmittedEvent(event) {
                emittedEvents.push(event);
            }

            updtr.exec = () => Promise.resolve({});

            updtr.on("test/step-a", saveEmittedEvent);
            updtr.on("test/step-b", saveEmittedEvent);

            await sequence.exec("step-a", "cmd-a");
            await sequence.exec("step-b", "cmd-b");

            expect(emittedEvents).toEqual([
                { ...baseEvent, cmd: "cmd-a" },
                { ...baseEvent, cmd: "cmd-b" },
            ]);
        });
    });
});
