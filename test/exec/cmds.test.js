"use strict";

const cmds = require("../../lib/exec/cmds");

describe("cmds", () => {
    describe(".npm", () => {
        describe(".outdated()", () => {
            test("should match snapshot", () => {
                expect(cmds.npm.outdated()).toMatchSnapshot();
            });
        });
        describe(".installMissing()", () => {
            test("should match snapshot", () => {
                expect(cmds.npm.installMissing()).toMatchSnapshot();
            });
        });
        describe(".install()", () => {
            describe("when just a name and a version is given", () => {
                test("should match snapshot", () => {
                    expect(cmds.npm.install({
                        name: "some-module",
                        version: "1.0.0",
                    })).toMatchSnapshot();
                });
            });
            describe("when a name, a version and a custom registry is given", () => {
                test("should match snapshot", () => {
                    expect(cmds.npm.install({
                        name: "some-module",
                        version: "1.0.0",
                        registry: "http://example.com/registry",
                    })).toMatchSnapshot();
                });
            });
        });
        describe(".remove()", () => {
            test("should match snapshot", () => {
                expect(cmds.npm.remove({
                    name: "some-module",
                })).toMatchSnapshot();
            });
        });
        describe(".test()", () => {
            test("should match snapshot", () => {
                expect(cmds.npm.test()).toMatchSnapshot();
            });
        });
    });
    describe(".yarn", () => {
        describe(".outdated()", () => {
            test("should match snapshot", () => {
                expect(cmds.yarn.outdated()).toMatchSnapshot();
            });
        });
        describe(".installMissing()", () => {
            test("should match snapshot", () => {
                expect(cmds.yarn.installMissing()).toMatchSnapshot();
            });
        });
        describe(".install()", () => {
            describe("when just a name and a version is given", () => {
                test("should match snapshot", () => {
                    expect(cmds.yarn.install({
                        name: "some-module",
                        version: "1.0.0",
                    })).toMatchSnapshot();
                });
            });
            describe("when a name, a version and a custom registry is given", () => {
                test("should match snapshot", () => {
                    expect(cmds.yarn.install({
                        name: "some-module",
                        version: "1.0.0",
                        registry: "http://example.com/registry",
                    })).toMatchSnapshot();
                });
            });
        });
        describe(".remove()", () => {
            test("should match snapshot", () => {
                expect(cmds.yarn.remove({
                    name: "some-module",
                })).toMatchSnapshot();
            });
        });
        describe(".test()", () => {
            test("should match snapshot", () => {
                expect(cmds.yarn.test()).toMatchSnapshot();
            });
        });
    });
});
