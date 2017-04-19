import updateVersionRange from "../../../src/tasks/util/updateVersionRange";
import versionRanges from "../../fixtures/versionRanges";

describe("updateVersionRange()", () => {
    it("should match the expected new version range", () => {
        const newVersionRanges = versionRanges.map(oldVersionRange =>
            updateVersionRange(oldVersionRange, "5.0.0")
        );
        const comparisons = versionRanges.map(
            (oldVersionRange, index) =>
                oldVersionRange + "     becomes     " + newVersionRanges[index]
        );

        expect(comparisons).toMatchSnapshot();
    });
    describe("when the new version contains a release tag", () => {
        it("should match the expected new version range", () => {
            const newVersionRanges = versionRanges.map(oldVersionRange =>
                updateVersionRange(oldVersionRange, "5.0.0-beta.1")
            );
            const comparisons = versionRanges.map(
                (oldVersionRange, index) =>
                    oldVersionRange +
                    "     becomes     " +
                    newVersionRanges[index]
            );

            expect(comparisons).toMatchSnapshot();
        });
    });
    describe("unexpected input", () => {
        describe("when the new version is a parseable range", () => {
            it("should just return the range", () => {
                expect(updateVersionRange("^1.0.0", "^5.0.0")).toBe("^5.0.0");
            });
        });
        describe("when the new version is not parseable", () => {
            it("should just return the new range", () => {
                expect(updateVersionRange("^1.0.0", "5.x")).toBe("5.x");
            });
        });
    });
});
