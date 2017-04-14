import EventEmitter from "events";
import os from "os";
import path from "path";
import Updtr from "../src/Updtr";
import fs from "../src/util/fs";
import {
    RequiredOptionMissingError,
    OptionValueNotSupportedError,
    YarnWithCustomRegistryError,
} from "../src/errors";
import { USE_YARN, UPDATE_TO_OPTIONS } from "../src/constants/config";
import temp from "./helpers/temp";
import FakeUpdtr from "./helpers/FakeUpdtr";

describe("new Updtr()", () => {
    test("should return an updtr with expected shape", () => {
        const updtr = new Updtr(FakeUpdtr.baseConfig);

        expect(updtr).toBeInstanceOf(EventEmitter);
        // Check for properties that are not tested in this unit test
        expect(updtr).toHaveProperty("cmds");
        expect(updtr).toHaveProperty("parse");
    });
    describe(".config", () => {
        test("should match the default shape", () => {
            const updtr = new Updtr(FakeUpdtr.baseConfig);

            expect(updtr.config).toMatchSnapshot();
        });
        describe(".updateTo", () => {
            UPDATE_TO_OPTIONS.forEach(updateTo => {
                test(`should be ${ updateTo } if given`, () => {
                    const config = { ...FakeUpdtr.baseConfig, updateTo };
                    const updtr = new Updtr(config);

                    expect(updtr.config).toHaveProperty("updateTo", updateTo);
                });
            });
        });
        describe(".exclude", () => {
            test("should match the given exclude array", () => {
                const config = {
                    ...FakeUpdtr.baseConfig,
                    exclude: ["a", "b", "c"],
                };
                const updtr = new Updtr(config);

                expect(updtr.config).toHaveProperty("exclude", ["a", "b", "c"]);
            });
        });
        describe(".registry", () => {
            test("should be set if a custom registry was given", () => {
                const config = {
                    ...FakeUpdtr.baseConfig,
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
                const config = { ...FakeUpdtr.baseConfig, use: USE_YARN };
                const updtr = new Updtr(config);

                expect(updtr.config).toHaveProperty("use", USE_YARN);
            });
        });
    });
    describe(".cmds", () => {
        describe(".test()", () => {
            describe("when a custom test command was given", () => {
                test("should return the custom test command", () => {
                    const test = "custom test command";
                    const config = { ...FakeUpdtr.baseConfig, test };
                    const updtr = new Updtr(config);

                    expect(updtr.cmds.test()).toBe(test);
                });
            });
        });
    });
    describe(".canAccessPackageJson()", () => {
        describe("when there is no package.json in the cwd", () => {
            test("should return false", async () => {
                const cwd = __dirname;
                const updtr = new Updtr({ ...FakeUpdtr.baseConfig, cwd });

                expect(await updtr.canAccessPackageJson()).toBe(false);
            });
        });
        describe("when there is a package.json in the cwd", () => {
            test("should return false", async () => {
                const cwd = path.join(__dirname, "fixtures", "empty");
                const updtr = new Updtr({ ...FakeUpdtr.baseConfig, cwd });

                expect(await updtr.canAccessPackageJson()).toBe(true);
            });
        });
    });
    describe(".exec()", () => {
        test("should exec the command in the given cwd", async () => {
            const cwd = __dirname;
            const updtr = new Updtr({ ...FakeUpdtr.baseConfig, cwd });
            const cmd = "node -e 'console.log(process.cwd())'";
            const result = await updtr.exec(cmd);

            expect(result.stdout).toBe(cwd + os.EOL);
        });
    });
    describe("readFile()", () => {
        it("should read a file as utf8 string relative to cwd", async () => {
            const testContent = "This is a test";
            const testJs = "test.js";
            const cwd = await temp.mkdir("updtr-readFile-1");
            const updtr = new Updtr({
                cwd,
            });

            await fs.writeFile(path.join(cwd, testJs), testContent);
            expect(await updtr.readFile(testJs)).toBe(testContent);
        });
        it("should not swallow errors", async () => {
            const testJs = "test.js";
            const cwd = await temp.mkdir("updtr-readFile-2");
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
            const cwd = await temp.mkdir("updtr-writeFile-1");
            const updtr = new Updtr({
                cwd,
            });

            await updtr.writeFile(testJs, testContent);

            expect(await fs.readFile(path.join(cwd, testJs), "utf8")).toBe(
                testContent
            );
        });
        it("should not swallow errors", async () => {
            const cwd = await temp.mkdir("updtr-writeFile-2");
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
            const updtr = new Updtr(FakeUpdtr.baseConfig);

            updtr.on("test", () => {
                throw new Error("Should not be called");
            });
            updtr.dispose();
            updtr.emit("test");
        });
    });
    describe("errors", () => {
        test("should throw if a cwd is missing", () => {
            const config = { ...FakeUpdtr.baseConfig };

            delete config.cwd;

            expect(() => new Updtr(config)).toThrow(RequiredOptionMissingError);
        });
        test("should throw if the use option is not supported", () => {
            const config = { ...FakeUpdtr.baseConfig, use: "bower" };

            expect(() => new Updtr(config)).toThrow(
                OptionValueNotSupportedError
            );
        });
        test("should throw if the updateTo option is unknown", () => {
            const config = {
                ...FakeUpdtr.baseConfig,
                updateTo: "something-else",
            };

            expect(() => new Updtr(config)).toThrow(
                OptionValueNotSupportedError
            );
        });
        test("should throw if the save option is unknown", () => {
            const config = { ...FakeUpdtr.baseConfig, save: "something-else" };

            expect(() => new Updtr(config)).toThrow(
                OptionValueNotSupportedError
            );
        });
        test("should throw if package manager is yarn and there is a custom registry set", () => {
            const config = {
                ...FakeUpdtr.baseConfig,
                registry: "http://example.com",
                use: USE_YARN,
            };

            expect(() => new Updtr(config)).toThrow(
                YarnWithCustomRegistryError
            );
        });
    });
});

afterAll(temp.cleanup);
