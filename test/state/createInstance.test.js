"use strict";

const createInstance = require("../../lib/state/createInstance");
const path = require("path");
const events = require("events");

const baseSideEffects = {
    existsSync: () => false,
};
const baseConfig = {
    cwd: __dirname,
};

describe("createInstance()", () => {
    test("should call config.reporter with an event emitter instance if a reporter was given", () => {
        const config = Object.assign({}, baseConfig);
        let givenEventEmitter;

        config.reporter = eventEmitter => {
            givenEventEmitter = eventEmitter;
        };

        createInstance(config, baseSideEffects);

        expect(givenEventEmitter).toBeInstanceOf(events);
    });
    test("should return an instance with expected shape", () => {
        const instance = createInstance(baseConfig, baseSideEffects);

        expect(instance).toHaveProperty("config");
        expect(instance).toHaveProperty("cmds");
        expect(instance).toHaveProperty("parse");

        // We don't want to snapshot these nested objects because they are tested separately
        instance.config = null;
        instance.cmds = null;
        instance.parse = null;
        expect(instance).toMatchSnapshot();
    });
    describe(".config", () => {
        test("should match the default shape", () => {
            const instance = createInstance(baseConfig, baseSideEffects);

            expect(instance.config).toMatchSnapshot();
        });
        describe(".updateTo", () => {
            test("should be 'wanted' if the wanted flag is set", () => {
                const config = Object.assign({}, baseConfig);

                config.wanted = true;

                const instance = createInstance(config, baseSideEffects);

                expect(instance.config).toHaveProperty("updateTo", "wanted");
            });
        });
        describe(".exclude", () => {
            test("should match the given exclude array with trimmed module names", () => {
                const config = Object.assign({}, baseConfig);

                config.exclude = ["  a  ", "  b  ", "  c  "];

                const instance = createInstance(config, baseSideEffects);

                expect(instance.config).toHaveProperty("exclude", [
                    "a",
                    "b",
                    "c",
                ]);
            });
            test("should be an array with trimmed module names if a comma separated list was given", () => {
                const config = Object.assign({}, baseConfig);

                config.exclude = "  a  ,  b  ,  c   ";

                const instance = createInstance(config, baseSideEffects);

                expect(instance.config).toHaveProperty("exclude", [
                    "a",
                    "b",
                    "c",
                ]);
            });
        });
        describe(".registry", () => {
            test("should be set if a custom registry was given", () => {
                const config = Object.assign({}, baseConfig);

                config.registry = "http://example.com";

                const instance = createInstance(config, baseSideEffects);

                expect(instance.config).toHaveProperty(
                    "registry",
                    "http://example.com"
                );
            });
        });
        describe(".packageManager", () => {
            test("should be 'yarn' if a yarn.lock file exists", () => {
                const sideEffects = Object.assign({}, baseSideEffects);
                let givenPath;

                sideEffects.existsSync = path => {
                    givenPath = path;

                    return true;
                };

                const instance = createInstance(baseConfig, sideEffects);

                expect(givenPath).toBe(path.join(baseConfig.cwd, "yarn.lock"));
                expect(instance.config).toHaveProperty(
                    "packageManager",
                    "yarn"
                );
            });
        });
    });
    describe(".emit()", () => {
        test("should call emit on the reporter event emitter with the given arguments", () => {
            const config = Object.assign({}, baseConfig);
            const event = {};
            let givenArguments;

            config.reporter = eventEmitter => {
                eventEmitter.emit = function () {
                    givenArguments = Array.from(arguments);
                };
            };

            const instance = createInstance(config, baseSideEffects);

            instance.emit("some-event", event);

            expect(givenArguments).toEqual(["some-event", event]);
        });
        test("should trace a nice error message to the console if the reporter threw an error", () => {
            const config = Object.assign({}, baseConfig);
            const sideEffects = Object.assign({}, baseSideEffects);
            let givenTrace;

            config.reporter = eventEmitter => {
                eventEmitter.emit = () => {
                    throw new Error("Oops!");
                };
            };
            sideEffects.trace = trace => {
                givenTrace = trace;
            };

            const instance = createInstance(config, sideEffects);

            instance.emit();

            expect(givenTrace).toMatch(/Reporter error/);
            expect(givenTrace).toMatch(/Error: Oops!/);
        });
    });
    describe("errors", () => {
        test("should throw if a cwd is missing", () => {
            const config = Object.assign({}, baseConfig);

            delete config.cwd;

            expect(() => createInstance(config, baseSideEffects)).toThrow(
                "Cannot run updtr: cwd is missing"
            );
        });
        test("should throw if the cwd contains a yarn.lock file and there is a custom registry set", () => {
            const config = Object.assign({}, baseConfig);
            const sideEffects = Object.assign({}, baseSideEffects);

            config.registry = "http://example.com";
            sideEffects.existsSync = () => true;

            expect(() => createInstance(config, sideEffects)).toThrow(
                "`yarn add` does not support custom registries yet. Please use a .npmrc file to achieve this."
            );
        });
    });
});
