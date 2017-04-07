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
        });
        describe(".install()", () => {
            describe("one module", () => {
                test("should match snapshot", () => {
                    expect(
                        cmds.npm.install({
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
                            cmds.npm.install({
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
                        cmds.npm.install({
                            modules: [
                                {
                                    name: "some-module-1",
                                    version: "1.0.0",
                                },
                                {
                                    name: "some-module-2",
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
                                        name: "some-module-1",
                                        version: "1.0.0",
                                    },
                                    {
                                        name: "some-module-2",
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
                                    name: "some-module-1",
                                    version: "1.0.0",
                                },
                                {
                                    name: "some-module-2",
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
                                        name: "some-module-1",
                                        version: "1.0.0",
                                    },
                                    {
                                        name: "some-module-2",
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
    });
});
