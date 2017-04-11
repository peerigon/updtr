import EventEmitter from "events";
import os from "os";
import fs from "fs";
import temp from "temp";
import pify from "pify";
import path from "path";
import Updtr from "../src/Updtr";

const mkdir = pify(temp.mkdir);
const cleanup = pify(temp.cleanup);
const writeFile = pify(fs.writeFile);
const readFile = pify(fs.readFile);

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
        describe(".nonBreaking", () => {
            test("should be true if the nonBreaking flag is set", () => {
                const config = { ...baseConfig, nonBreaking: true };
                const updtr = new Updtr(config);

                expect(updtr.config).toHaveProperty("nonBreaking", true);
            });
        });
        describe(".exclude", () => {
            test("should match the given exclude array", () => {
                const config = { ...baseConfig, exclude: ["a", "b", "c"] };
                const updtr = new Updtr(config);

                expect(updtr.config).toHaveProperty("exclude", ["a", "b", "c"]);
            });
        });
        describe(".registry", () => {
            test("should be set if a custom registry was given", () => {
                const config = {
                    ...baseConfig,
                    registry: "http://example.com",
                };
                const updtr = new Updtr(config);

                expect(updtr.config).toHaveProperty(
                    "registry",
                    "http://example.com"
                );
            });
        });
        describe(".use", () => {
            test("should be 'yarn' if specified", () => {
                const config = { ...baseConfig, use: "yarn" };
                const updtr = new Updtr(config);

                expect(updtr.config).toHaveProperty("use", "yarn");
            });
        });
    });
    describe(".cmds", () => {
        describe(".test()", () => {
            describe("when a custom test command was given", () => {
                test("should return the custom test command", () => {
                    const test = "custom test command";
                    const config = { ...baseConfig, test };
                    const updtr = new Updtr(config);

                    expect(updtr.cmds.test()).toBe(test);
                });
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
    describe("readFile()", () => {
        it("should read a file as utf8 string relative to cwd", async () => {
            const testContent = "This is a test";
            const testJs = "test.js";
            const cwd = await mkdir("updtr-readFile-1");
            const updtr = new Updtr({
                cwd,
            });

            await writeFile(path.join(cwd, testJs), testContent);
            expect(await updtr.readFile(testJs)).toBe(testContent);
        });
        it("should not swallow errors", async () => {
            const testJs = "test.js";
            const cwd = await mkdir("updtr-readFile-2");
            const updtr = new Updtr({
                cwd,
            });
            let givenErr;

            try {
                await updtr.readFile(testJs);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toHaveProperty("message");
            expect(givenErr.message).toMatch(/no such file or directory/);
        });
    });
    describe("writeFile()", () => {
        it("should write a file as utf8 string relative to cwd", async () => {
            const testContent = "This is a test";
            const testJs = "test.js";
            const cwd = await mkdir("updtr-writeFile-1");
            const updtr = new Updtr({
                cwd,
            });

            await updtr.writeFile(testJs, testContent);

            expect(await readFile(path.join(cwd, testJs), "utf8")).toBe(
                testContent
            );
        });
        it("should not swallow errors", async () => {
            const cwd = await mkdir("updtr-writeFile-2");
            const updtr = new Updtr({
                cwd,
            });
            let givenErr;

            try {
                await updtr.writeFile("");
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toHaveProperty("message");
            expect(givenErr.message).toMatch(
                /illegal operation on a directory/
            );
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

afterAll(cleanup);
