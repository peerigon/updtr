import updatePackageJson from "../../src/tasks/updatePackageJson";
import FakeUpdtr from "../helpers/FakeUpdtr";
import pickEventNames from "../helpers/pickEventNames";
import { testModule1Success, testModule2Fail } from "../fixtures/updateResults";
import { outdatedRegular } from "../fixtures/packageJsons";

describe("updatePackageJson()", () => {
    it("should read and write the package json", async () => {
        const updtr = new FakeUpdtr();
        const updateResults = [];

        updtr.readFile.resolves(JSON.stringify({}));
        updtr.writeFile.resolves();

        await updatePackageJson(updtr, updateResults);

        expect(updtr.readFile.calledWith("package.json")).toBe(true);
        expect(updtr.writeFile.calledWith("package.json")).toBe(true);
    });
    it("should save a package.json with expected shape to the cwd", async () => {
        const updtr = new FakeUpdtr();
        const updateResults = [testModule1Success, testModule2Fail];

        updtr.readFile.resolves(
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
        );
        updtr.writeFile.resolves();

        await updatePackageJson(updtr, updateResults);

        expect(updtr.readFile.calledWith("package.json")).toBe(true);
        expect(updtr.writeFile.calledWith("package.json")).toBe(true);

        const packageJson = JSON.parse(updtr.writeFile.getCall(0).args[1]);

        expect(packageJson).toMatchSnapshot();
    });
    it("should not alter the formatting", async () => {
        const updtr = new FakeUpdtr();
        const updateResults = [testModule1Success];
        const oldPackageJson = outdatedRegular;

        updtr.readFile.resolves(oldPackageJson);
        updtr.writeFile.resolves();

        await updatePackageJson(updtr, updateResults);

        const newPackageJson = updtr.writeFile.getCall(0).args[1];

        expect(newPackageJson).toBe(
            oldPackageJson.replace(
                /\^1\.0\.0/,
                "^" + testModule1Success.updateTo
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

        updtr.readFile.resolves(JSON.stringify({}));
        updtr.writeFile.resolves();

        await updatePackageJson(updtr, updateResults);

        expect(pickEventNames(eventNames, updtr.emit.args)).toEqual(eventNames);
    });
    describe("errors", () => {
        it("should enhance the error message in case the package json could not been read", async () => {
            const updtr = new FakeUpdtr();
            const updateResults = [];
            let givenErr;

            updtr.readFile.rejects(new Error("Oops"));

            try {
                await updatePackageJson(updtr, updateResults);
            } catch (err) {
                givenErr = err;
            }
            expect(givenErr.message).toMatchSnapshot();
        });
        it("should enhance the error message in case the package json could not been parsed", async () => {
            const updtr = new FakeUpdtr();
            const updateResults = [];
            let givenErr;

            updtr.readFile.resolves("Invalid JSON");

            try {
                await updatePackageJson(updtr, updateResults);
            } catch (err) {
                givenErr = err;
            }
            expect(givenErr.message).toMatchSnapshot();
        });
        it("should enhance the error message in case the package json could not been written", async () => {
            const updtr = new FakeUpdtr();
            const updateResults = [];
            let givenErr;

            updtr.readFile.resolves(JSON.stringify({}));
            updtr.writeFile.rejects(new Error("Oops"));

            try {
                await updatePackageJson(updtr, updateResults);
            } catch (err) {
                givenErr = err;
            }
            expect(givenErr.message).toMatchSnapshot();
        });
    });
});
