import EventEmitter from "events";
import os from "os";
import { UPDATE_TO_WANTED } from "../../src/constants/updateTask";
import Instance from "../../src/state/Instance";

const baseConfig = {
    cwd: __dirname,
};

describe("new Instance()", () => {
    test("should return an instance with expected shape", () => {
        const instance = new Instance(baseConfig);

        expect(instance).toBeInstanceOf(EventEmitter);
        // Check for properties that are not tested in this unit test
        expect(instance).toHaveProperty("cmds");
        expect(instance).toHaveProperty("parse");
    });
    describe(".config", () => {
        test("should match the default shape", () => {
            const instance = new Instance(baseConfig);

            expect(instance.config).toMatchSnapshot();
        });
        describe(".updateTo", () => {
            test("should be 'wanted' if the wanted flag is set", () => {
                const config = { ...baseConfig };

                config.wanted = true;

                const instance = new Instance(config);

                expect(instance.config).toHaveProperty(
                    "updateTo",
                    UPDATE_TO_WANTED
                );
            });
        });
        describe(".exclude", () => {
            test("should match the given exclude array", () => {
                const config = { ...baseConfig };

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
                const config = { ...baseConfig };

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
                const config = { ...baseConfig };

                config.packageManager = "yarn";

                const instance = new Instance(config);

                expect(instance.config).toHaveProperty(
                    "packageManager",
                    "yarn"
                );
            });
        });
    });
    describe(".exec()", () => {
        test("should exec the command in the given cwd", () => {
            const instance = new Instance(baseConfig);
            const cmd = "node -e 'console.log(process.cwd())'";

            return instance
                .exec(cmd)
                .then(result =>
                    expect(result.stdout).toBe(baseConfig.cwd + os.EOL));
        });
    });
    describe(".dispose()", () => {
        test("should remove all event listeners", () => {
            const instance = new Instance(baseConfig);

            instance.on("test", () => {
                throw new Error("Should not be called");
            });
            instance.dispose();
            instance.emit("test");
        });
    });
    describe("errors", () => {
        test("should throw if a cwd is missing", () => {
            const config = { ...baseConfig };

            delete config.cwd;

            expect(() => new Instance(config)).toThrow(
                "Cannot create updtr instance: cwd is missing"
            );
        });
        test("should throw if packageManager is yarn and there is a custom registry set", () => {
            const config = { ...baseConfig };

            config.registry = "http://example.com";
            config.packageManager = "yarn";

            expect(() => new Instance(config)).toThrow(
                "Cannot create updtr instance: yarn does not support custom registries yet. Please use a .npmrc file to achieve this"
            );
        });
    });
});
