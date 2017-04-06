import updateVersionRange from "../../../src/tasks/util/updateVersionRange";
import versionRanges from "../../fixtures/versionRanges";

describe("updateVersionRange()", () => {
    it("should match the expected new version range", () => {
        const newVersionRanges = versionRanges.map(oldVersionRange =>
        // const newVersionRanges = [">=1.0.0"].map(oldVersionRange =>
            updateVersionRange(oldVersionRange, "5.0.0"));
        const comparisons = versionRanges.map(
            (oldVersionRange, index) =>
                oldVersionRange + "     becomes     " + newVersionRanges[index]
        );

        expect(comparisons).toMatchSnapshot();
    });
});
