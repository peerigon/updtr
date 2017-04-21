import configList from "../../../src/reporters/util/configList";
import {
    USE_OPTIONS,
    UPDATE_TO_OPTIONS,
    SAVE_OPTIONS,
} from "../../../src/constants/config";

describe("configList()", () => {
    describe("when an empty object is passed", () => {
        it("should return an empty array", () => {
            expect(configList({})).toEqual([]);
        });
    });
    describe("when config.cwd is specified", () => {
        it("should return an empty array", () => {
            expect(
                configList({
                    cwd: "some/path",
                })
            ).toEqual([]);
        });
    });
    describe("when config.use is", () => {
        describe(USE_OPTIONS[0], () => {
            it("should return an empty array", () => {
                expect(
                    configList({
                        use: USE_OPTIONS[0],
                    })
                ).toEqual([]);
            });
        });
        describe("something else", () => {
            it("should return the expected line", () => {
                expect(
                    configList({
                        use: "yarn",
                    })[0]
                ).toMatchSnapshot("use");
            });
        });
    });
    describe("when config.exclude is", () => {
        describe("an empty array", () => {
            it("should return an empty array", () => {
                expect(
                    configList({
                        exclude: [],
                    })
                ).toEqual([]);
            });
        });
        describe("an array with module names", () => {
            it("should return the expected line", () => {
                expect(
                    configList({
                        exclude: ["a", "b", "c"],
                    })[0]
                ).toMatchSnapshot("exclude");
            });
        });
    });
    describe("when config.updateTo is", () => {
        describe(UPDATE_TO_OPTIONS[0], () => {
            it("should return an empty array", () => {
                expect(
                    configList({
                        updateTo: UPDATE_TO_OPTIONS[0],
                    })
                ).toEqual([]);
            });
        });
        describe("something else", () => {
            it("should return the expected line", () => {
                expect(
                    configList({
                        updateTo: "non-breaking",
                    })[0]
                ).toMatchSnapshot("updateTo");
            });
        });
    });
    describe("when config.save is", () => {
        describe(SAVE_OPTIONS[0], () => {
            it("should return an empty array", () => {
                expect(
                    configList({
                        save: SAVE_OPTIONS[0],
                    })
                ).toEqual([]);
            });
        });
        describe("something else", () => {
            it("should return the expected line", () => {
                expect(
                    configList({
                        save: "exact",
                    })[0]
                ).toMatchSnapshot("save");
            });
        });
    });
    describe("when config.test is specified", () => {
        it("should return the expected line", () => {
            expect(
                configList({
                    test: "custom test command",
                })[0]
            ).toMatchSnapshot("test");
        });
    });
    describe("when config.registry is specified", () => {
        it("should return the expected line", () => {
            expect(
                configList({
                    registry: "http://example.com",
                })[0]
            ).toMatchSnapshot("registry");
        });
    });
    describe("when unknown config keys are specified", () => {
        it("should ignore them", () => {
            expect(
                configList({
                    someOtherOption: true,
                })
            ).toEqual([]);
        });
    });
});
