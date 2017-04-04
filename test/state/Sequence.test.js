"use strict";

const Sequence = require("../../src/state/Sequence");
const Instance = require("../../src/state/Instance");

const baseEvent = {
    a: true,
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
            const event = { b: true };
            let givenEvent;

            instance.on("test", event => {
                givenEvent = event;
            });

            sequence.emit("test", event);

            expect(givenEvent).toEqual(Object.assign({}, event, baseEvent));
        });
    });
    describe(".exec()", () => {
        test("should emit each step with the given command", () => {
            const instance = new Instance(baseInstanceConfig);
            const sequence = new Sequence(instance, baseEvent);
            const emittedEvents = [];

            function saveEmittedEvent(event) {
                emittedEvents.push(event);
            }

            instance.exec = () => Promise.resolve({});

            instance.on("step-a", saveEmittedEvent);
            instance.on("step-b", saveEmittedEvent);

            return Promise.resolve([
                sequence.exec("step-a", "cmd-a"),
                sequence.exec("step-b", "cmd-b"),
            ]).then(() => {
                expect(emittedEvents).toEqual([
                    Object.assign({ cmd: "cmd-a" }, baseEvent),
                    Object.assign({ cmd: "cmd-b" }, baseEvent),
                ]);
            });
        });
        test("should save each exec stdout in stdouts under the given name", () => {
            const instance = new Instance(baseInstanceConfig);
            const sequence = new Sequence(instance, baseEvent);

            const execResults = [
                Promise.resolve({ stdout: "a" }),
                Promise.resolve({ stdout: "b" }),
            ];

            instance.exec = () => execResults.shift();

            return Promise.resolve([
                sequence.exec("step-a", "cmd-a"),
                sequence.exec("step-b", "cmd-b"),
            ]).then(() => {
                expect(sequence.stdouts.get("step-a")).toBe("a");
                expect(sequence.stdouts.get("step-b")).toBe("b");
            });
        });
        test("should also save the stdout of failed commands", () => {
            const instance = new Instance(baseInstanceConfig);
            const sequence = new Sequence(instance, baseEvent);
            const err = new Error();

            err.stdout = "a";
            instance.exec = () => Promise.reject(err);

            return sequence.exec("step-a", "cmd-a").catch(() => {
                expect(sequence.stdouts.get("step-a")).toBe("a");
            });
        });
    });
});
