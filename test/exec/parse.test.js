"use strict";

const path = require("path");
const setupFixtures = require("../helpers/setupFixtures");
const readFixture = require("../helpers/readFixture");
const parse = require("../../lib/exec/parse");

const fixtures = Object.keys(setupFixtures);
const stdoutLogs = new Map();

beforeAll(() => {
    const stdoutLogKeys = fixtures
        .reduce((arr, fixture) => arr.concat(
            path.join(fixture, "outdated.npm.log"),
            path.join(fixture, "outdated.yarn.log"),
        ), []);

    return Promise.all(stdoutLogKeys.map(readFixture))
        .then((fixtureContents) => fixtureContents.forEach((fixtureContent, index) => {
            stdoutLogs.set(stdoutLogKeys[index], fixtureContent);
        }));
});

describe("parse", () => {
    describe(".npm", () => {
        describe("outdated", () => {
            describe("empty fixture", () => {
                test("fixture sanity test", () => {
                    const fixture = stdoutLogs.get("empty/outdated.npm.log").trim();

                    expect(fixture.length).toBe(0);
                    expect(() => JSON.parse(fixture)).toThrow(new SyntaxError("Unexpected end of JSON input"));
                });
                test("should return an empty array", () => {
                    expect(parse.npm.outdated(stdoutLogs.get("empty/outdated.npm.log"))).toEqual([]);
                });
            });
            describe("no-outdated fixture", () => {
                test("fixture sanity test", () => {
                    const fixture = stdoutLogs.get("no-outdated/outdated.npm.log").trim();

                    expect(fixture.length).toBe(0);
                    expect(() => JSON.parse(fixture)).toThrow(new SyntaxError("Unexpected end of JSON input"));
                });
                test("should return an empty array", () => {
                    expect(parse.npm.outdated(stdoutLogs.get("no-outdated/outdated.npm.log"))).toEqual([]);
                });
            });
            describe("outdated fixture", () => {
                test("fixture sanity test", () => {
                    const fixture = stdoutLogs.get("outdated/outdated.npm.log").trim();

                    expect(fixture.length).toBeGreaterThan(10);
                    JSON.parse(fixture); // should be parseable
                });
                test("should return an array with normalized outdated data", () => {
                    expect(parse.npm.outdated(stdoutLogs.get("outdated/outdated.npm.log"))).toEqual([
                        {
                            name: "updtr-test-module-1",
                            current: "1.1.1",
                            wanted: "1.1.1",
                            latest: "2.0.0",
                            type: 0,
                        },
                        {
                            name: "updtr-test-module-2",
                            current: "1.1.1",
                            wanted: "1.1.1",
                            latest: "2.1.1",
                            type: 0,
                        },
                    ]);
                });
            });
            describe("outdated-dev fixture", () => {
                test("fixture sanity test", () => {
                    const fixture = stdoutLogs.get("outdated-dev/outdated.npm.log").trim();

                    expect(fixture.length).toBeGreaterThan(10);
                    JSON.parse(fixture); // should be parseable
                });
                test("should return an array with normalized outdated data", () => {
                    expect(parse.npm.outdated(stdoutLogs.get("outdated-dev/outdated.npm.log"))).toEqual([
                        {
                            name: "updtr-test-module-1",
                            current: "1.1.1",
                            wanted: "1.1.1",
                            latest: "2.0.0",
                            type: 1,
                        },
                        {
                            name: "updtr-test-module-2",
                            current: "1.1.1",
                            wanted: "1.1.1",
                            latest: "2.1.1",
                            type: 1,
                        },
                    ]);
                });
            });
        });
    });
    describe(".yarn", () => {
        describe("outdated", () => {
            describe("empty fixture", () => {
                test("fixture sanity test", () => {
                    const fixture = stdoutLogs.get("empty/outdated.yarn.log").trim();

                    expect(fixture.length).toBe(0);
                    expect(() => JSON.parse(fixture)).toThrow(new SyntaxError("Unexpected end of JSON input"));
                });
                test("should return an empty array", () => {
                    expect(parse.yarn.outdated(stdoutLogs.get("empty/outdated.yarn.log"))).toEqual([]);
                });
            });
            describe("no-outdated fixture", () => {
                test("fixture sanity test", () => {
                    const fixture = stdoutLogs.get("no-outdated/outdated.yarn.log").trim();

                    expect(fixture.length).toBe(0);
                    expect(() => JSON.parse(fixture)).toThrow(new SyntaxError("Unexpected end of JSON input"));
                });
                test("should return an empty array", () => {
                    expect(parse.yarn.outdated(stdoutLogs.get("no-outdated/outdated.yarn.log"))).toEqual([]);
                });
            });
            describe("outdated fixture", () => {
                test("fixture sanity test", () => {
                    const fixture = stdoutLogs.get("outdated/outdated.yarn.log").trim();

                    expect(fixture.length).toBeGreaterThan(10);
                    JSON.parse(fixture); // should be parseable
                });
                test("should return an array with normalized outdated data", () => {
                    expect(parse.yarn.outdated(stdoutLogs.get("outdated/outdated.yarn.log"))).toEqual([
                        {
                            name: "updtr-test-module-1",
                            current: "1.1.1",
                            wanted: "1.1.1",
                            latest: "2.0.0",
                            type: 0,
                        },
                        {
                            name: "updtr-test-module-2",
                            current: "1.1.1",
                            wanted: "1.1.1",
                            latest: "2.1.1",
                            type: 0,
                        },
                    ]);
                });
            });
            describe("outdated-dev fixture", () => {
                test("fixture sanity test", () => {
                    const fixture = stdoutLogs.get("outdated-dev/outdated.yarn.log").trim();

                    expect(fixture.length).toBeGreaterThan(10);
                    JSON.parse(fixture); // should be parseable
                });
                test("should return an array with normalized outdated data", () => {
                    expect(parse.yarn.outdated(stdoutLogs.get("outdated-dev/outdated.yarn.log"))).toEqual([
                        {
                            name: "updtr-test-module-1",
                            current: "1.1.1",
                            wanted: "1.1.1",
                            latest: "2.0.0",
                            type: 1,
                        },
                        {
                            name: "updtr-test-module-2",
                            current: "1.1.1",
                            wanted: "1.1.1",
                            latest: "2.1.1",
                            type: 1,
                        },
                    ]);
                });
            });
        });
    });
});
