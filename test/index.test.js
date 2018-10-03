import Updtr from "../src/Updtr";
import FakeUpdtr from "./helpers/FakeUpdtr";
const index = require("../src");

describe("index", () => {
    describe(".create", () => {
        it("should be a function", () => {
            expect(typeof index.create).toBe("function");
        });
        it("should return an instance of Updtr", () => {
            expect(index.create(FakeUpdtr.baseConfig)).toBeInstanceOf(Updtr);
        });
    });
    describe(".run", () => {
        it("should be a function", () => {
            expect(typeof index.run).toBe("function");
        });
    });
    describe(".errors", () => {
        it("should be an object with expected shape", () => {
            expect(index.errors).toMatchSnapshot();
        });
    });
});
