const index = require("../src");

describe("index", () => {
    describe(".create", () => {
        test("should be a function", () => {
            expect(typeof index.create).toBe("function");
        });
    });
    describe(".run", () => {
        test("should be a function", () => {
            expect(typeof index.run).toBe("function");
        });
    });
});

export default {};
