import readFixtures from "../helpers/readFixtures";
import parse from "../../src/exec/parse";

let jsonUnexpectedEndOfInput;
let stdoutLogs;

function testUnexpectedInput(parse) {
    describe("unexpected input", () => {
        describe("malformed JSON", () => {
            it("should throw with a helpful error message", () => {
                expect(() => parse("{", "my-cmd")).toThrow(
                    "Error when trying to parse stdout from command 'my-cmd': " +
                        jsonUnexpectedEndOfInput.message
                );
            });
        });
        describe("unexpected data format", () => {
            it("should throw with a helpful error message", () => {
                expect(() =>
                    parse(
                        JSON.stringify({ some: { randomData: true } }),
                        "my-cmd"
                    )
                )
                    // We don't really want to test for the actual error message here,
                    // but just whether there is an error message at all.
                    .toThrow(
                    /Error when trying to parse stdout from command 'my-cmd': \w+/
                    );
            });
        });
    });
}

beforeAll(async () => {
    stdoutLogs = await readFixtures([
        "empty/outdated.npm.log",
        "empty/outdated.yarn.log",
        "empty/list.npm.log",
        "empty/list.yarn.log",
        "no-outdated/outdated.npm.log",
        "no-outdated/outdated.yarn.log",
        "no-outdated/list.npm.log",
        "no-outdated/list.yarn.log",
        "no-outdated-dev/outdated.npm.log",
        "no-outdated-dev/outdated.yarn.log",
        "no-outdated-dev/list.npm.log",
        "no-outdated-dev/list.yarn.log",
        "outdated/outdated.npm.log",
        "outdated/outdated.yarn.log",
        "outdated/list.npm.log",
        "outdated/list.yarn.log",
        "outdated-dev/outdated.npm.log",
        "outdated-dev/outdated.yarn.log",
        "outdated-dev/list.npm.log",
        "outdated-dev/list.yarn.log",
    ]);
    try {
        JSON.parse("");
    } catch (err) {
        jsonUnexpectedEndOfInput = err;
    }
});

describe("parse", () => {
    describe(".npm", () => {
        describe(".outdated()", () => {
            describe("empty fixture", () => {
                it("fixture sanity test", () => {
                    const fixture = stdoutLogs
                        .get("empty/outdated.npm.log")
                        .trim();

                    expect(fixture.length).toBe(0);
                    expect(() => JSON.parse(fixture)).toThrow(
                        jsonUnexpectedEndOfInput
                    );
                });
                it("should return an empty array", () => {
                    expect(
                        parse.npm.outdated(
                            stdoutLogs.get("empty/outdated.npm.log")
                        )
                    ).toEqual([]);
                });
            });
            describe("no-outdated fixture", () => {
                it("fixture sanity test", () => {
                    const fixture = stdoutLogs
                        .get("no-outdated/outdated.npm.log")
                        .trim();

                    expect(fixture.length).toBe(0);
                    expect(() => JSON.parse(fixture)).toThrow(
                        jsonUnexpectedEndOfInput
                    );
                });
                it("should return an empty array", () => {
                    expect(
                        parse.npm.outdated(
                            stdoutLogs.get("no-outdated/outdated.npm.log")
                        )
                    ).toEqual([]);
                });
            });
            describe("no-outdated-dev fixture", () => {
                it("fixture sanity test", () => {
                    const fixture = stdoutLogs
                        .get("no-outdated-dev/outdated.npm.log")
                        .trim();

                    expect(fixture.length).toBe(0);
                    expect(() => JSON.parse(fixture)).toThrow(
                        jsonUnexpectedEndOfInput
                    );
                });
                it("should return an empty array", () => {
                    expect(
                        parse.npm.outdated(
                            stdoutLogs.get("no-outdated-dev/outdated.npm.log")
                        )
                    ).toEqual([]);
                });
            });
            describe("outdated fixture", () => {
                it("fixture sanity test", () => {
                    const fixture = stdoutLogs
                        .get("outdated/outdated.npm.log")
                        .trim();

                    expect(fixture.length).toBeGreaterThan(10);
                    JSON.parse(fixture); // should be parseable
                });
                it("should return an array with normalized outdated data", () => {
                    expect(
                        parse.npm.outdated(
                            stdoutLogs.get("outdated/outdated.npm.log")
                        )
                    ).toMatchSnapshot();
                });
            });
            describe("outdated-dev fixture", () => {
                it("fixture sanity test", () => {
                    const fixture = stdoutLogs
                        .get("outdated-dev/outdated.npm.log")
                        .trim();

                    expect(fixture.length).toBeGreaterThan(10);
                    JSON.parse(fixture); // should be parseable
                });
                it("should return an array with normalized outdated data", () => {
                    expect(
                        parse.npm.outdated(
                            stdoutLogs.get("outdated-dev/outdated.npm.log")
                        )
                    ).toMatchSnapshot();
                });
            });
            testUnexpectedInput(parse.npm.outdated);
        });
        describe(".list()", () => {
            function testFixture(fixtureName) {
                it("fixture sanity test", () => {
                    const fixture = stdoutLogs
                        .get(fixtureName + "/list.npm.log")
                        .trim();

                    expect(fixture.length).toBeGreaterThan(10);
                    JSON.parse(fixture); // should be parseable
                });
                it("should return an array with installed versions", () => {
                    expect(
                        parse.npm.list(
                            stdoutLogs.get(fixtureName + "/list.npm.log")
                        )
                    ).toMatchSnapshot();
                });
            }

            describe("empty fixture", () => {
                it("fixture sanity test", () => {
                    const fixture = stdoutLogs.get("empty/list.npm.log").trim();

                    expect(fixture.length).toBeGreaterThan(10);
                    JSON.parse(fixture); // should be parseable
                });
                it("should return an empty array", () => {
                    expect(
                        parse.npm.list(stdoutLogs.get("empty/list.npm.log"))
                    ).toEqual([]);
                });
            });

            describe("no-outdated fixture", () => {
                testFixture("no-outdated");
            });

            describe("no-outdated-dev fixture", () => {
                testFixture("no-outdated-dev");
            });

            describe("outdated fixture", () => {
                testFixture("outdated");
            });

            describe("outdated-dev fixture", () => {
                testFixture("outdated-dev");
            });
        });
    });
    describe(".yarn", () => {
        describe(".outdated()", () => {
            describe("empty fixture", () => {
                it("fixture sanity test", () => {
                    const fixture = stdoutLogs
                        .get("empty/outdated.yarn.log")
                        .trim();

                    expect(fixture.length).toBe(0);
                    expect(() => JSON.parse(fixture)).toThrow(
                        jsonUnexpectedEndOfInput
                    );
                });
                it("should return an empty array", () => {
                    expect(
                        parse.yarn.outdated(
                            stdoutLogs.get("empty/outdated.yarn.log")
                        )
                    ).toEqual([]);
                });
            });
            describe("no-outdated fixture", () => {
                it("fixture sanity test", () => {
                    const fixture = stdoutLogs
                        .get("no-outdated/outdated.yarn.log")
                        .trim();

                    expect(fixture.length).toBe(0);
                    expect(() => JSON.parse(fixture)).toThrow(
                        jsonUnexpectedEndOfInput
                    );
                });
                it("should return an empty array", () => {
                    expect(
                        parse.yarn.outdated(
                            stdoutLogs.get("no-outdated/outdated.yarn.log")
                        )
                    ).toEqual([]);
                });
            });
            describe("no-outdated-dev fixture", () => {
                it("fixture sanity test", () => {
                    const fixture = stdoutLogs
                        .get("no-outdated-dev/outdated.yarn.log")
                        .trim();

                    expect(fixture.length).toBe(0);
                    expect(() => JSON.parse(fixture)).toThrow(
                        jsonUnexpectedEndOfInput
                    );
                });
                it("should return an empty array", () => {
                    expect(
                        parse.yarn.outdated(
                            stdoutLogs.get("no-outdated-dev/outdated.yarn.log")
                        )
                    ).toEqual([]);
                });
            });
            describe("outdated fixture", () => {
                it("fixture sanity test", () => {
                    const fixture = stdoutLogs
                        .get("outdated/outdated.yarn.log")
                        .trim();

                    expect(fixture.length).toBeGreaterThan(10);
                    JSON.parse(fixture); // should be parseable
                });
                it("should return an array with normalized outdated data", () => {
                    expect(
                        parse.yarn.outdated(
                            stdoutLogs.get("outdated/outdated.yarn.log")
                        )
                    ).toMatchSnapshot();
                });
            });
            describe("outdated-dev fixture", () => {
                it("fixture sanity test", () => {
                    const fixture = stdoutLogs
                        .get("outdated-dev/outdated.yarn.log")
                        .trim();

                    expect(fixture.length).toBeGreaterThan(10);
                    JSON.parse(fixture); // should be parseable
                });
                it("should return an array with normalized outdated data", () => {
                    expect(
                        parse.yarn.outdated(
                            stdoutLogs.get("outdated-dev/outdated.yarn.log")
                        )
                    ).toMatchSnapshot();
                });
            });
            testUnexpectedInput(parse.yarn.outdated);
        });
        describe(".list()", () => {
            it("should be the same implementation as .npm.list", () => {
                expect(parse.yarn.list).toBe(parse.npm.list);
            });
        });
    });
});
