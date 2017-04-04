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
    describe(".name", () => {
        test("should be the given name", () => {
            const updtr = new Updtr(baseUpdtrConfig);
            const sequence = new Sequence("test", updtr, baseEvent);

            expect(sequence.name).toBe("test");
        });
    });
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
    describe(".isRunning", () => {
        test("should be false by default", () => {
            const updtr = new Updtr(baseUpdtrConfig);
            const sequence = new Sequence("test", updtr, baseEvent);

            expect(sequence.isRunning).toBe(false);
        });
    });
    describe(".start()", () => {
        test("should emit a start event on the updtr instance", () => {
            const updtr = new Updtr(baseUpdtrConfig);
            const sequence = new Sequence("test", updtr, baseEvent);
            let hasBeenCalled = false;

            updtr.on("test/start", () => {
                hasBeenCalled = true;
            });

            sequence.start();

            expect(hasBeenCalled).toBe(true);
        });
        test("should set the isRunning flag to true", () => {
            const updtr = new Updtr(baseUpdtrConfig);
            const sequence = new Sequence("test", updtr, baseEvent);

            sequence.start();

            expect(sequence.isRunning).toBe(true);
        });
    });
    describe(".end()", () => {
        test("should emit an end event on the updtr instance with the result", () => {
            const updtr = new Updtr(baseUpdtrConfig);
            const sequence = new Sequence("test", updtr, baseEvent);
            const result = { c: true };
            let givenEvent;

            updtr.on("test/end", event => {
                givenEvent = event;
            });

            sequence.start();
            sequence.end(result);

            expect(givenEvent).toEqual({ ...baseEvent, ...result });
        });
        test("should set the isRunning flag to false", () => {
            const updtr = new Updtr(baseUpdtrConfig);
            const sequence = new Sequence("test", updtr, baseEvent);

            sequence.start();
            sequence.end();

            expect(sequence.isRunning).toBe(false);
        });
    });
    describe(".emit()", () => {
        describe("when the sequence has been started", () => {
            test("should emit an event on the updtr under the given namespace", () => {
                const updtr = new Updtr(baseUpdtrConfig);
                const sequence = new Sequence("test", updtr, baseEvent);
                let hasBeenCalled = false;

                updtr.on("test/test", () => {
                    hasBeenCalled = true;
                });

                sequence.start();
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

                sequence.start();
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

                sequence.start();
                sequence.emit("test", event);

                expect(givenEvent).toEqual({ ...baseEvent, ...event });
            });
        });
        describe("when the sequence has not been started", () => {
            test("should throw an error", () => {
                const updtr = new Updtr(baseUpdtrConfig);
                const sequence = new Sequence("test", updtr, baseEvent);

                expect(() => sequence.emit("test")).toThrow(
                    "Cannot emit event test/test: sequence is not running"
                );
            });
        });
        describe("when the sequence has already ended", () => {
            test("should throw an error", () => {
                const updtr = new Updtr(baseUpdtrConfig);
                const sequence = new Sequence("test", updtr, baseEvent);

                sequence.start();
                sequence.end();

                expect(() => sequence.emit("test")).toThrow(
                    "Cannot emit event test/test: sequence is not running"
                );
            });
        });
    });
    describe(".exec()", () => {
        describe("when the sequence is running", () => {
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

                sequence.start();
                await sequence.exec("step-a", "cmd-a");
                await sequence.exec("step-b", "cmd-b");

                expect(emittedEvents).toEqual([
                    { ...baseEvent, cmd: "cmd-a" },
                    { ...baseEvent, cmd: "cmd-b" },
                ]);
            });
        });
        describe("when the sequence has not been started", () => {
            test("should throw an error", () => {
                const updtr = new Updtr(baseUpdtrConfig);
                const sequence = new Sequence("test", updtr, baseEvent);

                expect(() => sequence.exec("step-a", "cmd-a")).toThrow(
                    "Cannot emit event test/step-a: sequence is not running"
                );
            });
        });
        describe("when the sequence has already ended", () => {
            test("should throw an error", () => {
                const updtr = new Updtr(baseUpdtrConfig);
                const sequence = new Sequence("test", updtr, baseEvent);

                sequence.start();
                sequence.end();

                expect(() => sequence.emit("test")).toThrow(
                    "Cannot emit event test/test: sequence is not running"
                );
            });
        });
    });
});
