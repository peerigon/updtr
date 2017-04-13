import clone from "clone";
import { SAVE_CARET, SAVE_EXACT } from "../../../src/constants/config";
import createUpdatedPackageJson
    from "../../../src/tasks/util/createUpdatedPackageJson";
import {
    testModule1Success,
    testModule2Success,
    testModule1Fail,
    testModule2Fail,
} from "../../fixtures/updateResults";
import FakeUpdtr from "../../helpers/FakeUpdtr";

// Freezes the essential parts of the package.json to detect changes on the input object
function cloneAndFreeze(packageJson) {
    const cloned = clone(packageJson);

    Object.freeze(cloned.dependencies);
    Object.freeze(cloned.devDependencies);
    Object.freeze(cloned.optionalDependencies);

    return Object.freeze(cloned);
}

describe("createUpdatedPackageJson()", () => {
    it("should not create new fields by default", () => {
        const updateResults = [];
        const newPackageJson = createUpdatedPackageJson(
            Object.freeze({}),
            updateResults,
            FakeUpdtr.baseConfig
        );

        expect(newPackageJson).toEqual({});
    });
    it("should not create new fields for failed update results", () => {
        const updateResults = [testModule1Fail, testModule2Fail];
        const newPackageJson = createUpdatedPackageJson(
            Object.freeze({}),
            updateResults,
            FakeUpdtr.baseConfig
        );

        expect(newPackageJson).toEqual({});
    });
    describe("dependencies", () => {
        it("should write the versions of the successful updates to the package json", () => {
            const updateResults = [testModule1Success, testModule2Fail];
            const newPackageJson = createUpdatedPackageJson(
                cloneAndFreeze({
                    dependencies: {
                        "dep-1": "1.0.0",
                        "dep-2": "1.0.0",
                        "updtr-test-module-1": "1.0.0",
                        "updtr-test-module-2": "1.0.0",
                    },
                }),
                updateResults,
                FakeUpdtr.baseConfig
            );

            expect(newPackageJson).toMatchSnapshot();
        });
        describe(`when the save option is "${ SAVE_EXACT }"`, () => {
            it("should save the exact version", () => {
                const updateResults = [testModule1Success];
                const newPackageJson = createUpdatedPackageJson(
                    cloneAndFreeze({
                        dependencies: {
                            "updtr-test-module-1": "^1.0.0",
                        },
                    }),
                    updateResults,
                    { ...FakeUpdtr.baseConfig, save: SAVE_EXACT }
                );

                expect(newPackageJson.dependencies["updtr-test-module-1"]).toBe(
                    testModule1Success.updateTo
                );
            });
        });
        describe(`when the save option is "${ SAVE_CARET }"`, () => {
            it("should save the exact version", () => {
                const updateResults = [testModule1Success];
                const newPackageJson = createUpdatedPackageJson(
                    cloneAndFreeze({
                        dependencies: {
                            "updtr-test-module-1": "1.0.0",
                        },
                    }),
                    updateResults,
                    { ...FakeUpdtr.baseConfig, save: SAVE_CARET }
                );

                expect(newPackageJson.dependencies["updtr-test-module-1"]).toBe(
                    "^" + testModule1Success.updateTo
                );
            });
        });
    });
    describe("devDependencies", () => {
        it("should write the versions of the successful updates to the package json", () => {
            const updateResults = [testModule1Success, testModule2Fail];
            const newPackageJson = createUpdatedPackageJson(
                cloneAndFreeze({
                    devDependencies: {
                        "dep-1": "1.0.0",
                        "dep-2": "1.0.0",
                        "updtr-test-module-1": "1.0.0",
                        "updtr-test-module-2": "1.0.0",
                    },
                }),
                updateResults,
                FakeUpdtr.baseConfig
            );

            expect(newPackageJson).toMatchSnapshot();
        });
        describe(`when the save option is "${ SAVE_EXACT }"`, () => {
            it("should save the exact version", () => {
                const updateResults = [testModule1Success];
                const newPackageJson = createUpdatedPackageJson(
                    cloneAndFreeze({
                        devDependencies: {
                            "updtr-test-module-1": "^1.0.0",
                        },
                    }),
                    updateResults,
                    { ...FakeUpdtr.baseConfig, save: SAVE_EXACT }
                );

                expect(
                    newPackageJson.devDependencies["updtr-test-module-1"]
                ).toBe(testModule1Success.updateTo);
            });
        });
        describe(`when the save option is "${ SAVE_CARET }"`, () => {
            it("should save the exact version", () => {
                const updateResults = [testModule1Success];
                const newPackageJson = createUpdatedPackageJson(
                    cloneAndFreeze({
                        dependencies: {
                            "updtr-test-module-1": "1.0.0",
                        },
                    }),
                    updateResults,
                    { ...FakeUpdtr.baseConfig, save: SAVE_CARET }
                );

                expect(newPackageJson.dependencies["updtr-test-module-1"]).toBe(
                    "^" + testModule1Success.updateTo
                );
            });
        });
    });
    describe("optionalDependencies", () => {
        it("should write the versions of the successful updates to the package json", () => {
            const updateResults = [testModule1Success, testModule2Fail];
            const newPackageJson = createUpdatedPackageJson(
                cloneAndFreeze({
                    optionalDependencies: {
                        "dep-1": "1.0.0",
                        "dep-2": "1.0.0",
                        "updtr-test-module-1": "1.0.0",
                        "updtr-test-module-2": "1.0.0",
                    },
                }),
                updateResults,
                FakeUpdtr.baseConfig
            );

            expect(newPackageJson).toMatchSnapshot();
        });
        describe(`when the save option is "${ SAVE_EXACT }"`, () => {
            it("should save the exact version", () => {
                const updateResults = [testModule1Success];
                const newPackageJson = createUpdatedPackageJson(
                    cloneAndFreeze({
                        optionalDependencies: {
                            "updtr-test-module-1": "^1.0.0",
                        },
                    }),
                    updateResults,
                    { ...FakeUpdtr.baseConfig, save: SAVE_EXACT }
                );

                expect(
                    newPackageJson.optionalDependencies["updtr-test-module-1"]
                ).toBe(testModule1Success.updateTo);
            });
        });
        describe(`when the save option is "${ SAVE_CARET }"`, () => {
            it("should save the exact version", () => {
                const updateResults = [testModule1Success];
                const newPackageJson = createUpdatedPackageJson(
                    cloneAndFreeze({
                        dependencies: {
                            "updtr-test-module-1": "1.0.0",
                        },
                    }),
                    updateResults,
                    { ...FakeUpdtr.baseConfig, save: SAVE_CARET }
                );

                expect(newPackageJson.dependencies["updtr-test-module-1"]).toBe(
                    "^" + testModule1Success.updateTo
                );
            });
        });
    });
    // This is usually an error, but we don't care
    describe("when a module is listed in more than one dependency type", () => {
        it("should update all dependency occurrences", () => {
            const updateResults = [testModule1Success];
            const newPackageJson = createUpdatedPackageJson(
                cloneAndFreeze({
                    dependencies: {
                        "updtr-test-module-1": "1.0.0",
                    },
                    devDependencies: {
                        "updtr-test-module-1": "^1.0.0",
                    },
                    optionalDependencies: {
                        "updtr-test-module-1": "1.x.x",
                    },
                }),
                updateResults,
                FakeUpdtr.baseConfig
            );

            expect(newPackageJson).toMatchSnapshot();
        });
    });
    describe("when the updated modules are not listed as any dependency type", () => {
        it("should save the modules as regular dependency", () => {
            const updateResults = [testModule1Success, testModule2Success];
            const newPackageJson = createUpdatedPackageJson(
                Object.freeze({}),
                updateResults,
                FakeUpdtr.baseConfig
            );

            expect(newPackageJson).toMatchSnapshot();
        });
    });
});
