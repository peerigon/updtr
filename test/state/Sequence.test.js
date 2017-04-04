import Sequence from "../../src/state/Sequence";
import Instance from "../../src/state/Instance";

const baseEvent = {
    a: true,
    b: true,
};
const baseInstanceConfig = {
    cwd: __dirname,
};

describe("new Sequence()", () => {
    describe(".instance", () => {
        test("should be the given instance", () => {
            const instance = new Instance(baseInstanceConfig);
            const sequence = new Sequence("test", instance, baseEvent);

            expect(sequence.instance).toBe(instance);
        });
    });
    describe(".baseEvent", () => {
        test("should be the given baseEvent", () => {
            const instance = new Instance(baseInstanceConfig);
            const sequence = new Sequence("test", instance, baseEvent);

            expect(sequence.baseEvent).toBe(baseEvent);
        });
    });
    describe(".emit()", () => {
        test("should emit an event on the instance under the given namespace", () => {
            const instance = new Instance(baseInstanceConfig);
            const sequence = new Sequence("test", instance, baseEvent);
            let hasBeenCalled = false;

            instance.on("test/test", () => {
                hasBeenCalled = true;
            });

            sequence.emit("test");

            expect(hasBeenCalled).toBe(true);
        });
        test("should not emit the base event itself but a copy of it when no event object is given", () => {
            const instance = new Instance(baseInstanceConfig);
            const sequence = new Sequence("test", instance, baseEvent);
            let givenEvent;

            instance.on("test/test", event => {
                givenEvent = event;
            });

            sequence.emit("test");

            expect(givenEvent).not.toBe(baseEvent);
            expect(givenEvent).toEqual(baseEvent);
        });
        test("should emit an event on the instance with the properties of the given base event", () => {
            const instance = new Instance(baseInstanceConfig);
            const sequence = new Sequence("test", instance, baseEvent);
            const event = { b: false, c: true };
            let givenEvent;

            instance.on("test/test", event => {
                givenEvent = event;
            });

            sequence.emit("test", event);

            expect(givenEvent).toEqual({ ...baseEvent, ...event });
        });
    });
    describe(".exec()", () => {
        test("should emit an event on the instance for each step with the given command", async () => {
            const instance = new Instance(baseInstanceConfig);
            const sequence = new Sequence("test", instance, baseEvent);
            const emittedEvents = [];

            function saveEmittedEvent(event) {
                emittedEvents.push(event);
            }

            instance.exec = () => Promise.resolve({});

            instance.on("test/step-a", saveEmittedEvent);
            instance.on("test/step-b", saveEmittedEvent);

            await sequence.exec("step-a", "cmd-a");
            await sequence.exec("step-b", "cmd-b");

            expect(emittedEvents).toEqual([
                { ...baseEvent, cmd: "cmd-a" },
                { ...baseEvent, cmd: "cmd-b" },
            ]);
        });
    });
});
