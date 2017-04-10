import splitUpdateTasks from "../../../src/tasks/util/splitUpdateTasks";

const breakingUpdateTasks = [
    {
        name: "module-1",
        updateTo: "2.0.0",
        rollbackTo: "1.0.1",
    },
    {
        name: "module-2",
        updateTo: "2.0.0",
        rollbackTo: "1.1.0",
    },
];
const nonBreakingUpdateTasks = [
    {
        // Does not occur in the real-world since these modules are not outdated.
        // However, we still test it here for consistency.
        name: "module-1",
        updateTo: "1.0.0",
        rollbackTo: "1.0.0",
    },
    {
        name: "module-2",
        updateTo: "1.0.1",
        rollbackTo: "1.0.0",
    },
    {
        name: "module-3",
        updateTo: "1.1.0",
        rollbackTo: "1.0.0",
    },
];
const preVersionUpdateTasks = [
    {
        // diff = prerelease
        name: "module-1",
        updateTo: "1.0.1-beta.2",
        rollbackTo: "1.0.1-beta.1",
    },
    {
        // diff = prepatch
        name: "module-2",
        updateTo: "1.0.2-beta.2",
        rollbackTo: "1.0.1-beta.1",
    },
    {
        // diff = preminor
        name: "module-3",
        updateTo: "1.1.0-beta.2",
        rollbackTo: "1.0.1-beta.1",
    },
    {
        // diff = premajor
        name: "module-4",
        updateTo: "2.0.0-beta.2",
        rollbackTo: "1.0.1-beta.1",
    },
];

describe("splitUpdateTasks()", () => {
    describe(".breaking", () => {
        test("should be empty by default", () => {
            expect(splitUpdateTasks([]).breaking).toEqual([]);
        });
        test("should be empty if there are just non-breaking updates", () => {
            expect(splitUpdateTasks(nonBreakingUpdateTasks).breaking).toEqual([
            ]);
        });
        test("should be an array with all breaking updates", () => {
            const updateTasks = nonBreakingUpdateTasks.concat(
                breakingUpdateTasks
            );

            expect(splitUpdateTasks(updateTasks).breaking).toEqual(
                breakingUpdateTasks
            );
        });
        test("should contain all pre-version updates since they are considered to be unstable", () => {
            expect(splitUpdateTasks(preVersionUpdateTasks).breaking).toEqual(
                preVersionUpdateTasks
            );
        });
    });
    describe(".nonBreaking", () => {
        test("should be empty by default", () => {
            expect(splitUpdateTasks([]).nonBreaking).toEqual([]);
        });
        test("should be empty if there are just breaking updates", () => {
            expect(splitUpdateTasks(breakingUpdateTasks).nonBreaking).toEqual([
            ]);
        });
        test("should be an array with all non-breaking updates", () => {
            const updateTasks = breakingUpdateTasks.concat(
                nonBreakingUpdateTasks
            );

            expect(splitUpdateTasks(updateTasks).nonBreaking).toEqual(
                nonBreakingUpdateTasks
            );
        });
        test("should not contain pre-version updates since they are considered to be unstable", () => {
            expect(
                splitUpdateTasks(preVersionUpdateTasks).nonBreaking
            ).toEqual([]);
        });
    });
});
