import cmds from "../../src/exec/cmds";

describe("cmds", () => {
    describe(".npm", () => {
        describe(".outdated()", () => {
            it("should match snapshot", () => {
                expect(cmds.npm.outdated()).toMatchSnapshot();
            });
        });
        describe(".installMissing()", () => {
            it("should match snapshot", () => {
                expect(cmds.npm.installMissing()).toMatchSnapshot();
            });
            describe("custom registry", () => {
                it("should match snapshot", () => {
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
                it("should match snapshot", () => {
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
                    it("should match snapshot", () => {
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
                it("should match snapshot", () => {
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
                    it("should match snapshot", () => {
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
            it("should match snapshot", () => {
                expect(cmds.npm.test()).toMatchSnapshot();
            });
        });
        describe(".list()", () => {
            describe("no arguments", () => {
                it("should match snapshot", () => {
                    expect(cmds.npm.list()).toMatchSnapshot();
                });
            });
            describe("with modules", () => {
                it("should match snapshot", () => {
                    expect(
                        cmds.npm.list({ modules: ["a", "b", "c"] })
                    ).toMatchSnapshot();
                });
            });
        });
    });
    describe(".yarn", () => {
        describe(".outdated()", () => {
            it("should match snapshot", () => {
                expect(cmds.yarn.outdated()).toMatchSnapshot();
            });
        });
        describe(".installMissing()", () => {
            it("should match snapshot", () => {
                expect(cmds.yarn.installMissing()).toMatchSnapshot();
            });
            describe("custom registry", () => {
                it("should match snapshot", () => {
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
                it("should match snapshot", () => {
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
                    it("should match snapshot", () => {
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
                it("should match snapshot", () => {
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
                    it("should match snapshot", () => {
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
            it("should match snapshot", () => {
                expect(cmds.yarn.test()).toMatchSnapshot();
            });
        });
        describe(".list()", () => {
            it("should match snapshot", () => {
                expect(cmds.yarn.list()).toMatchSnapshot();
            });
        });
    });
});
