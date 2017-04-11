import run from "../src/run";
import reporters from "../src/reporters";
const index = require("../src");

describe("index", () => {
    describe(".run", () => {
        test("should be the run function", () => {
            expect(index).toHaveProperty("run", run);
        });
    });
    describe(".reporters", () => {
        test("should be the reporters object", () => {
            expect(index).toHaveProperty("reporters", reporters);
        });
    });
});
