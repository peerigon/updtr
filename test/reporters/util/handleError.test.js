import {spy} from "sinon";
import handleError from "../../../src/reporters/util/handleError";
import {PackageJsonNoAccessError} from "../../../src/errors";

const processExit = process.exit;
const consoleError = console.error;

function setupSpies() {
    process.exit = spy();
    console.error = spy();
}

describe("handleError()", () => {
    describe("when err is a PackageJsonNoAccessError", () => {
        it("should console.error a descriptive error message and process.exit(1)", () => {
            setupSpies();
            handleError(new PackageJsonNoAccessError());

            const errorStr = console.error.firstCall.args[0];

            expect(errorStr).toContain("[41m[1m ERROR [22m[49m");
            expect(errorStr).toContain(
                "Cannot find package.json in current directory"
            );
            expect(process.exit.calledWith(1)).toBe(true);
        });
    });
    describe("when err is unknown", () => {
        it("should console.error the error message and process.exit(1)", () => {
            setupSpies();
            handleError(new Error("Unknown error"));

            const errorStr = console.error.firstCall.args[0];

            expect(errorStr).toContain("[41m[1m ERROR [22m[49m");
            expect(errorStr).toContain("Unknown error");
            // Check for greyed out stack
            expect(errorStr).toContain("[90m    at");
            expect(process.exit.calledWith(1)).toBe(true);
        });
    });
});

afterAll(() => {
    process.exit = processExit;
    console.error = consoleError;
});
