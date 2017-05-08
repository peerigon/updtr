import Sequence from "../../../src/tasks/util/Sequence";
import FakeUpdtr from "../../helpers/FakeUpdtr";

const baseEvent = {
    a: true,
    b: true,
};

describe("new Sequence()", () => {
    describe(".name", () => {
        it("should be the given name", () => {
            const updtr = new FakeUpdtr();
            const sequence = new Sequence("test", updtr, baseEvent);

            expect(sequence.name).toBe("test");
        });
    });
    describe(".updtr", () => {
        it("should be the given updtr", () => {
            const updtr = new FakeUpdtr();
            const sequence = new Sequence("test", updtr, baseEvent);

            expect(sequence.updtr).toBe(updtr);
        });
    });
    describe(".baseEvent", () => {
        it("should be an empty object by default", () => {
            const updtr = new FakeUpdtr();
            const sequence = new Sequence("test", updtr);

            expect(sequence.baseEvent).toEqual({});
        });
        it("should be the given baseEvent", () => {
            const updtr = new FakeUpdtr();
            const sequence = new Sequence("test", updtr, baseEvent);

            expect(sequence.baseEvent).toBe(baseEvent);
        });
    });
    describe(".isRunning", () => {
        it("should be false by default", () => {
            const updtr = new FakeUpdtr();
            const sequence = new Sequence("test", updtr, baseEvent);

            expect(sequence.isRunning).toBe(false);
        });
    });
    describe(".start()", () => {
        it("should emit a start event on the updtr instance", () => {
            const updtr = new FakeUpdtr();
            const sequence = new Sequence("test", updtr, baseEvent);

            sequence.start();

            expect(updtr.emit.calledOnce).toBe(true);
        });
        it("should set the isRunning flag to true", () => {
            const updtr = new FakeUpdtr();
            const sequence = new Sequence("test", updtr, baseEvent);

            sequence.start();

            expect(sequence.isRunning).toBe(true);
        });
    });
    describe(".end()", () => {
        it("should emit an end event on the updtr instance with the result", () => {
            const updtr = new FakeUpdtr();
            const sequence = new Sequence("test", updtr, baseEvent);
            const result = { c: true };

            sequence.start();
            sequence.end(result);

            expect(updtr.emit.getCall(1).args).toEqual([
                "test/end",
                { ...baseEvent, ...result },
            ]);
        });
        it("should set the isRunning flag to false", () => {
            const updtr = new FakeUpdtr();
            const sequence = new Sequence("test", updtr, baseEvent);

            sequence.start();
            sequence.end();

            expect(sequence.isRunning).toBe(false);
        });
    });
    describe(".emit()", () => {
        describe("when the sequence has been started", () => {
            it("should emit an event on the updtr under the given namespace", () => {
                const updtr = new FakeUpdtr();
                const sequence = new Sequence("test", updtr, baseEvent);

                sequence.start();
                sequence.emit("test");

                expect(updtr.emit.calledWith("test/test")).toBe(true);
            });
            it("should not emit the base event itself but a copy of it when no event object is given", () => {
                const updtr = new FakeUpdtr();
                const sequence = new Sequence("test", updtr, baseEvent);

                sequence.start();
                sequence.emit("test");

                const emittedEvent = updtr.emit.getCall(1).args[1];

                expect(emittedEvent).not.toBe(baseEvent);
                expect(emittedEvent).toEqual(baseEvent);
            });
            it("should emit an event on the updtr with the properties of the given base event", () => {
                const updtr = new FakeUpdtr();
                const sequence = new Sequence("test", updtr, baseEvent);
                const event = { b: false, c: true };

                sequence.start();
                sequence.emit("test", event);

                const emittedEvent = updtr.emit.getCall(1).args[1];

                expect(emittedEvent).toEqual({ ...baseEvent, ...event });
            });
        });
        describe("when the sequence has not been started", () => {
            it("should throw an error", () => {
                const updtr = new FakeUpdtr();
                const sequence = new Sequence("test", updtr, baseEvent);

                expect(() => sequence.emit("test")).toThrow(
                    "Cannot emit event test/test: sequence is not running"
                );
            });
        });
        describe("when the sequence has already ended", () => {
            it("should throw an error", () => {
                const updtr = new FakeUpdtr();
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
            it("should emit an event on the updtr for each step with the given command", async () => {
                const updtr = new FakeUpdtr();
                const sequence = new Sequence("test", updtr, baseEvent);

                updtr.exec = () => Promise.resolve({});

                sequence.start();
                await sequence.exec("step-a", "cmd-a");
                await sequence.exec("step-b", "cmd-b");

                expect([
                    updtr.emit.getCall(1).args,
                    updtr.emit.getCall(2).args,
                ]).toEqual([
                    ["test/step-a", { ...baseEvent, cmd: "cmd-a" }],
                    ["test/step-b", { ...baseEvent, cmd: "cmd-b" }],
                ]);
            });
        });
        describe("when the sequence has not been started", () => {
            it("should throw an error", () => {
                const updtr = new FakeUpdtr();
                const sequence = new Sequence("test", updtr, baseEvent);

                expect(() => sequence.exec("step-a", "cmd-a")).toThrow(
                    "Cannot emit event test/step-a: sequence is not running"
                );
            });
        });
        describe("when the sequence has already ended", () => {
            it("should throw an error", () => {
                const updtr = new FakeUpdtr();
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
