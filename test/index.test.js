import Updtr from "../src/Updtr";
import FakeUpdtr from "./helpers/FakeUpdtr";

const index = require("../src");

describe("index", () => {
    describe(".create", () => {
        test("should be a function", () => {
            expect(typeof index.create).toBe("function");
        });
        test("should return an instance of Updtr", () => {
            expect(index.create(FakeUpdtr.baseConfig)).toBeInstanceOf(Updtr);
        });
    });
    describe(".run", () => {
        test("should be a function", () => {
            expect(typeof index.run).toBe("function");
        });
    });
});
