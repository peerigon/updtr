import updatePackageJson from "../../src/tasks/updatePackageJson";
import FakeUpdtr from "../helpers/FakeUpdtr";
import pickEventNames from "../helpers/pickEventNames";
import {
    testModule1Success,
    testModule1Fail,
    testModule2Success,
    testModule2Fail,
} from "../fixtures/updateResults";
import {
    ready as packageJsonsReady,
    outdatedRegular,
} from "../fixtures/packageJsons";

describe("updatePackageJson()", () => {
    it("should read and write the package json", async () => {
        const updtr = new FakeUpdtr();
        const updateResults = [];

        updtr.readFile.returns(Promise.resolve(JSON.stringify({})));
        updtr.writeFile.returns(Promise.resolve());

        await updatePackageJson(updtr, updateResults);

        expect(updtr.readFile.calledWith("package.json")).toBe(true);
        expect(updtr.writeFile.calledWith("package.json")).toBe(true);
    });
    it("should save a package.json with expected shape to the cwd", async () => {
        const updtr = new FakeUpdtr();
        const updateResults = [testModule1Success, testModule2Fail];

        updtr.readFile.returns(
            Promise.resolve(
                JSON.stringify({
                    dependencies: {
                        [testModule1Success.name]: "1.0.0",
                        [testModule2Fail.name]: "1.0.x",
                    },
                    devDependencies: {
                        [testModule1Success.name]: "~1.0.x",
                        [testModule2Fail.name]: "1.0.x",
                    },
                })
            )
        );
        updtr.writeFile.returns(Promise.resolve());

        await updatePackageJson(updtr, updateResults);

        expect(updtr.readFile.calledWith("package.json")).toBe(true);
        expect(updtr.writeFile.calledWith("package.json")).toBe(true);

        const packageJson = JSON.parse(updtr.writeFile.getCall(0).args[1]);

        expect(packageJson).toMatchSnapshot();
    });
    it("should not alter the format", async () => {
        await packageJsonsReady;

        const updtr = new FakeUpdtr();
        const updateResults = [testModule1Success];
        const oldPackageJson = outdatedRegular;

        updtr.readFile.returns(Promise.resolve(oldPackageJson));
        updtr.writeFile.returns(Promise.resolve());

        await updatePackageJson(updtr, updateResults);

        const newPackageJson = updtr.writeFile.getCall(0).args[1];

        expect(newPackageJson).toBe(
            oldPackageJson.replace(
                /\^1\.0\.0/,
                "^" + testModule1Success.version
            )
        );
    });
    it("should emit the expected events", async () => {
        const updtr = new FakeUpdtr();
        const updateResults = [testModule1Success];
        const eventNames = [
            "update-package-json/start",
            "update-package-json/end",
        ];

        updtr.readFile.returns(Promise.resolve(JSON.stringify({})));
        updtr.writeFile.returns(Promise.resolve());

        await updatePackageJson(updtr, updateResults);

        expect(pickEventNames(eventNames, updtr.emit.args)).toEqual(eventNames);
    });
});
