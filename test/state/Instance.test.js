"use strict";

const Instance = require("../../lib/state/Instance");
const EventEmitter = require("events");

const baseConfig = {
    cwd: __dirname,
};

describe("new Instance()", () => {
    test("should return an instance with expected shape", () => {
        const instance = new Instance(baseConfig);

        expect(instance).toBeInstanceOf(EventEmitter);
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
            const instance = new Instance(baseConfig);

            expect(instance.config).toMatchSnapshot();
        });
        describe(".updateTo", () => {
            test("should be 'wanted' if the wanted flag is set", () => {
                const config = Object.assign({}, baseConfig);

                config.wanted = true;

                const instance = new Instance(config);

                expect(instance.config).toHaveProperty("updateTo", "wanted");
            });
        });
        describe(".exclude", () => {
            test("should match the given exclude array", () => {
                const config = Object.assign({}, baseConfig);

                config.exclude = ["a", "b", "c"];

                const instance = new Instance(config);

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

                const instance = new Instance(config);

                expect(instance.config).toHaveProperty(
                    "registry",
                    "http://example.com"
                );
            });
        });
        describe(".packageManager", () => {
            test("should be 'yarn' if specified", () => {
                const config = Object.assign({}, baseConfig);

                config.packageManager = "yarn";

                const instance = new Instance(config);

                expect(instance.config).toHaveProperty(
                    "packageManager",
                    "yarn"
                );
            });
        });
    });
    describe("errors", () => {
        test("should throw if a cwd is missing", () => {
            const config = Object.assign({}, baseConfig);

            delete config.cwd;

            expect(() => new Instance(config)).toThrow(
                "Cannot create updtr instance: cwd is missing"
            );
        });
        test("should throw if packageManager is yarn and there is a custom registry set", () => {
            const config = Object.assign({}, baseConfig);

            config.registry = "http://example.com";
            config.packageManager = "yarn";

            expect(() => new Instance(config)).toThrow(
                "Cannot create updtr instance: yarn does not support custom registries yet. Please use a .npmrc file to achieve this"
            );
        });
    });
});
