import createUpdatedPackageJson
    from "../../../src/tasks/util/createUpdatedPackageJson";
import {
    testModule1Success,
    testModule2Success,
    testModule1Fail,
    testModule2Fail,
} from "../../fixtures/updateResults";
import {
    ready as packageJsonsReady,
    outdatedDev as oldPackageJsonDev,
    outdatedRegular as oldPackageJson,
} from "../../fixtures/packageJsons";

beforeAll(() => packageJsonsReady);

describe.skip("createUpdatedPackageJson()", () => {
    describe("with regular dependencies", () => {
        it("should write the versions of the successful updates to the package json", () => {
            const updateResults = [testModule1Success, testModule2Fail];
            const newPackageJson = createUpdatedPackageJson(
                oldPackageJson,
                updateResults
            );

            expect(newPackageJson).toMatchSnapshot();
        });
    });
});
