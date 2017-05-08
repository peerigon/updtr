import reporters from "../../src/reporters";

describe("reporters", () => {
    it("should export all available reporters", () => {
        expect(Object.keys(reporters)).toMatchSnapshot();
    });
});
