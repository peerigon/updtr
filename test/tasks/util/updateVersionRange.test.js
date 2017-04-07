import updateVersionRange from "../../../src/tasks/util/updateVersionRange";
import versionRanges from "../../fixtures/versionRanges";

describe("updateVersionRange()", () => {
    it("should match the expected new version range", () => {
        const newVersionRanges = versionRanges.map(oldVersionRange =>
            updateVersionRange(oldVersionRange, "5.0.0"));
        const comparisons = versionRanges.map(
            (oldVersionRange, index) =>
                oldVersionRange + "     becomes     " + newVersionRanges[index]
        );

        expect(comparisons).toMatchSnapshot();
    });
    describe("when the new version contains a release tag", () => {
        it("should match the expected new version range", () => {
            const newVersionRanges = versionRanges.map(oldVersionRange =>
                updateVersionRange(oldVersionRange, "5.0.0-beta.1"));
            const comparisons = versionRanges.map(
                (oldVersionRange, index) =>
                    oldVersionRange +
                    "     becomes     " +
                    newVersionRanges[index]
            );

            expect(comparisons).toMatchSnapshot();
        });
    });
});
