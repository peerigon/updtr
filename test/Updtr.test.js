import EventEmitter from "events";
import os from "os";
import { UPDATE_TO_WANTED } from "../src/constants/updateTask";
import Updtr from "../src/Updtr";

const baseConfig = {
    cwd: __dirname,
};

describe("new Updtr()", () => {
    test("should return an updtr with expected shape", () => {
        const updtr = new Updtr(baseConfig);

        expect(updtr).toBeInstanceOf(EventEmitter);
        // Check for properties that are not tested in this unit test
        expect(updtr).toHaveProperty("cmds");
        expect(updtr).toHaveProperty("parse");
    });
    describe(".config", () => {
        test("should match the default shape", () => {
            const updtr = new Updtr(baseConfig);

            expect(updtr.config).toMatchSnapshot();
        });
        describe(".updateTo", () => {
            test("should be 'wanted' if the wanted flag is set", () => {
                const config = { ...baseConfig };

                config.wanted = true;

                const updtr = new Updtr(config);

                expect(updtr.config).toHaveProperty(
                    "updateTo",
                    UPDATE_TO_WANTED
                );
            });
        });
        describe(".exclude", () => {
            test("should match the given exclude array", () => {
                const config = { ...baseConfig };

                config.exclude = ["a", "b", "c"];

                const updtr = new Updtr(config);

                expect(updtr.config).toHaveProperty("exclude", ["a", "b", "c"]);
            });
        });
        describe(".registry", () => {
            test("should be set if a custom registry was given", () => {
                const config = { ...baseConfig };

                config.registry = "http://example.com";

                const updtr = new Updtr(config);

                expect(updtr.config).toHaveProperty(
                    "registry",
                    "http://example.com"
                );
            });
        });
        describe(".packageManager", () => {
            test("should be 'yarn' if specified", () => {
                const config = { ...baseConfig };

                config.use = "yarn";

                const updtr = new Updtr(config);

                expect(updtr.config).toHaveProperty("packageManager", "yarn");
            });
        });
    });
    describe(".exec()", () => {
        test("should exec the command in the given cwd", async () => {
            const updtr = new Updtr(baseConfig);
            const cmd = "node -e 'console.log(process.cwd())'";
            const result = await updtr.exec(cmd);

            expect(result.stdout).toBe(baseConfig.cwd + os.EOL);
        });
    });
    describe(".dispose()", () => {
        test("should remove all event listeners", () => {
            const updtr = new Updtr(baseConfig);

            updtr.on("test", () => {
                throw new Error("Should not be called");
            });
            updtr.dispose();
            updtr.emit("test");
        });
    });
    describe("errors", () => {
        test("should throw if a cwd is missing", () => {
            const config = { ...baseConfig };

            delete config.cwd;

            expect(() => new Updtr(config)).toThrow(
                "Cannot create updtr instance: cwd is missing"
            );
        });
        test("should throw if packageManager is yarn and there is a custom registry set", () => {
            const config = { ...baseConfig };

            config.registry = "http://example.com";
            config.use = "yarn";

            expect(() => new Updtr(config)).toThrow(
                "Cannot create updtr instance: yarn does not support custom registries yet. Please use a .npmrc file to achieve this"
            );
        });
    });
});
