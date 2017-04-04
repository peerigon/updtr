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
    describe(".stdouts", () => {
        test("should be a map", () => {
            const instance = new Instance(baseInstanceConfig);
            const sequence = new Sequence(instance, baseEvent);

            expect(sequence.stdouts).toBeInstanceOf(Map);
        });
    });
    describe(".emit()", () => {
        test("should not emit the base event itself but a copy of it when no event object is given", () => {
            const instance = new Instance(baseInstanceConfig);
            const sequence = new Sequence(instance, baseEvent);
            let givenEvent;

            instance.on("test", event => {
                givenEvent = event;
            });

            sequence.emit("test");

            expect(givenEvent).not.toBe(baseEvent);
            expect(givenEvent).toEqual(baseEvent);
        });
        test("should emit an event on the instance with the properties of the given base event", () => {
            const instance = new Instance(baseInstanceConfig);
            const sequence = new Sequence(instance, baseEvent);
            const event = { b: false, c: true };
            let givenEvent;

            instance.on("test", event => {
                givenEvent = event;
            });

            sequence.emit("test", event);

            expect(givenEvent).toEqual({ ...baseEvent, ...event });
        });
    });
    describe(".exec()", () => {
        test("should emit each step with the given command", async () => {
            const instance = new Instance(baseInstanceConfig);
            const sequence = new Sequence(instance, baseEvent);
            const emittedEvents = [];

            function saveEmittedEvent(event) {
                emittedEvents.push(event);
            }

            instance.exec = () => Promise.resolve({});

            instance.on("step-a", saveEmittedEvent);
            instance.on("step-b", saveEmittedEvent);

            await sequence.exec("step-a", "cmd-a");
            await sequence.exec("step-b", "cmd-b");

            expect(emittedEvents).toEqual([
                { ...baseEvent, cmd: "cmd-a" },
                { ...baseEvent, cmd: "cmd-b" },
            ]);
        });
        test("should save each exec stdout in stdouts under the given name", async () => {
            const instance = new Instance(baseInstanceConfig);
            const sequence = new Sequence(instance, baseEvent);

            const execResults = [
                Promise.resolve({ stdout: "a" }),
                Promise.resolve({ stdout: "b" }),
            ];

            instance.exec = () => execResults.shift();

            await sequence.exec("step-a", "cmd-a");
            await sequence.exec("step-b", "cmd-b");

            expect(sequence.stdouts.get("step-a")).toBe("a");
            expect(sequence.stdouts.get("step-b")).toBe("b");
        });
        test("should also save the stdout of failed commands", async () => {
            const instance = new Instance(baseInstanceConfig);
            const sequence = new Sequence(instance, baseEvent);
            const err = new Error();
            let givenErr;

            err.stdout = "a";
            instance.exec = () => Promise.reject(err);

            try {
                await sequence.exec("step-a", "cmd-a");
            } catch (e) {
                givenErr = e;
            }

            expect(givenErr).toBe(err);
            expect(sequence.stdouts.get("step-a")).toBe("a");
        });
    });
});
