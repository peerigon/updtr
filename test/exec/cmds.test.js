import cmds from "../../src/exec/cmds";

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
            describe("custom registry", () => {
                test("should match snapshot", () => {
                    expect(
                        cmds.npm.installMissing({
                            registry: "http://example.com",
                        })
                    ).toMatchSnapshot();
                });
            });
        });
        describe(".install()", () => {
            describe("one module", () => {
                test("should match snapshot", () => {
                    expect(
                        cmds.npm.install({
                            modules: [
                                {
                                    name: "a",
                                    version: "1.0.0",
                                },
                            ],
                        })
                    ).toMatchSnapshot();
                });
                describe("custom registry", () => {
                    test("should match snapshot", () => {
                        expect(
                            cmds.npm.install({
                                registry: "http://example.com/registry",
                                modules: [
                                    {
                                        name: "a",
                                        version: "1.0.0",
                                    },
                                ],
                            })
                        ).toMatchSnapshot();
                    });
                });
            });
            describe("multiple modules", () => {
                test("should match snapshot", () => {
                    expect(
                        cmds.npm.install({
                            modules: [
                                {
                                    name: "a",
                                    version: "1.0.0",
                                },
                                {
                                    name: "b",
                                    version: "1.0.0",
                                },
                            ],
                        })
                    ).toMatchSnapshot();
                });
                describe("custom registry", () => {
                    test("should match snapshot", () => {
                        expect(
                            cmds.npm.install({
                                registry: "http://example.com/registry",
                                modules: [
                                    {
                                        name: "a",
                                        version: "1.0.0",
                                    },
                                    {
                                        name: "b",
                                        version: "1.0.0",
                                    },
                                ],
                            })
                        ).toMatchSnapshot();
                    });
                });
            });
        });
        describe(".test()", () => {
            test("should match snapshot", () => {
                expect(cmds.npm.test()).toMatchSnapshot();
            });
        });
        describe(".list()", () => {
            describe("no arguments", () => {
                test("should match snapshot", () => {
                    expect(cmds.npm.list()).toMatchSnapshot();
                });
            });
            describe("with modules", () => {
                test("should match snapshot", () => {
                    expect(
                        cmds.npm.list({ modules: ["a", "b", "c"] })
                    ).toMatchSnapshot();
                });
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
            describe("custom registry", () => {
                test("should match snapshot", () => {
                    expect(
                        cmds.yarn.installMissing({
                            registry: "http://example.com",
                        })
                    ).toMatchSnapshot();
                });
            });
        });
        describe(".install()", () => {
            describe("one module", () => {
                test("should match snapshot", () => {
                    expect(
                        cmds.yarn.install({
                            modules: [
                                {
                                    name: "some-module",
                                    version: "1.0.0",
                                },
                            ],
                        })
                    ).toMatchSnapshot();
                });
                describe("custom registry", () => {
                    test("should match snapshot", () => {
                        expect(
                            cmds.yarn.install({
                                registry: "http://example.com/registry",
                                modules: [
                                    {
                                        name: "some-module",
                                        version: "1.0.0",
                                    },
                                ],
                            })
                        ).toMatchSnapshot();
                    });
                });
            });
            describe("multiple modules", () => {
                test("should match snapshot", () => {
                    expect(
                        cmds.yarn.install({
                            modules: [
                                {
                                    name: "a",
                                    version: "1.0.0",
                                },
                                {
                                    name: "b",
                                    version: "1.0.0",
                                },
                            ],
                        })
                    ).toMatchSnapshot();
                });
                describe("custom registry", () => {
                    test("should match snapshot", () => {
                        expect(
                            cmds.yarn.install({
                                registry: "http://example.com/registry",
                                modules: [
                                    {
                                        name: "a",
                                        version: "1.0.0",
                                    },
                                    {
                                        name: "b",
                                        version: "1.0.0",
                                    },
                                ],
                            })
                        ).toMatchSnapshot();
                    });
                });
            });
        });
        describe(".test()", () => {
            test("should match snapshot", () => {
                expect(cmds.yarn.test()).toMatchSnapshot();
            });
        });
        describe(".list()", () => {
            test("should be the same implementation as .npm.list", () => {
                expect(cmds.yarn.list).toBe(cmds.npm.list);
            });
        });
    });
});
