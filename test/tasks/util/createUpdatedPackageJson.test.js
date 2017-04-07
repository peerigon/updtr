import clone from "clone";
import createUpdatedPackageJson
    from "../../../src/tasks/util/createUpdatedPackageJson";
import {
    testModule1Success,
    testModule2Success,
    testModule1Fail,
    testModule2Fail,
} from "../../fixtures/updateResults";

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
            updateResults
        );

        expect(newPackageJson).toEqual({});
    });
    it("should not create new fields for failed update results", () => {
        const updateResults = [testModule1Fail, testModule2Fail];
        const newPackageJson = createUpdatedPackageJson(
            Object.freeze({}),
            updateResults
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
                updateResults
            );

            expect(newPackageJson).toMatchSnapshot();
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
                updateResults
            );

            expect(newPackageJson).toMatchSnapshot();
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
                updateResults
            );

            expect(newPackageJson).toMatchSnapshot();
        });
    });
    // This is usually an error, but we don't care
    describe("when a library is listed in more than one dependency map", () => {
        it("should update all dependency maps", () => {
            const updateResults = [testModule1Success];
            const newPackageJson = createUpdatedPackageJson(
                cloneAndFreeze({
                    dependencies: {
                        "updtr-test-module-1": "1.0.0",
                    },
                    devDependencies: {
                        "updtr-test-module-1": "1.0.0",
                    },
                    optionalDependencies: {
                        "updtr-test-module-1": "1.0.0",
                    },
                }),
                updateResults
            );

            expect(newPackageJson).toMatchSnapshot();
        });
    });
    describe("when the updated libraries are not listed in any dependency map", () => {
        it("should save the modules as regular dependency", () => {
            const updateResults = [testModule1Success, testModule2Success];
            const newPackageJson = createUpdatedPackageJson(
                Object.freeze({}),
                updateResults
            );

            expect(newPackageJson).toMatchSnapshot();
        });
    });
});
