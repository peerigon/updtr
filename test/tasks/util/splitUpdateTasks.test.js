import splitUpdateTasks from "../../../src/tasks/util/splitUpdateTasks";

const breakingUpdateTasks = [
    {
        updateTo: "2.0.0",
        rollbackTo: "1.0.1",
    },
    {
        updateTo: "2.0.0",
        rollbackTo: "1.1.0",
    },
    {
        updateTo: "0.2.0",
        rollbackTo: "0.1.0",
    },
    {
        updateTo: "0.0.2",
        rollbackTo: "0.0.1",
    },
];
const nonBreakingUpdateTasks = [
    {
        // Does not occur in the real-world since these modules are not outdated.
        // However, we still test it here for consistency.
        updateTo: "1.0.0",
        rollbackTo: "1.0.0",
    },
    {
        updateTo: "^1.0.0",
        rollbackTo: "1.0.0",
    },
    {
        updateTo: "1.0.1",
        rollbackTo: "1.0.0",
    },
    {
        updateTo: "^1.0.1",
        rollbackTo: "1.0.1",
    },
    {
        updateTo: "1.1.0",
        rollbackTo: "1.0.0",
    },
    {
        updateTo: "^1.1.0",
        rollbackTo: "1.1.0",
    },
    {
        updateTo: "^0.1.0",
        rollbackTo: "0.1.0",
    },
    {
        updateTo: "^0.0.1",
        rollbackTo: "0.0.1",
    },
];
const nonBreakingPreVersionUpdateTasks = [
    {
        updateTo: "^0.0.1-beta.1",
        rollbackTo: "0.0.1-beta.1",
    },
    {
        updateTo: "^0.1.0-beta.1",
        rollbackTo: "0.1.0-beta.1",
    },
    {
        updateTo: "^1.0.0-beta.1",
        rollbackTo: "1.0.0-beta.1",
    },
    {
        updateTo: "^1.1.0-beta.1",
        rollbackTo: "1.1.0-beta.1",
    },
    {
        updateTo: "^1.1.1-beta.1",
        rollbackTo: "1.1.1-beta.1",
    },
    {
        updateTo: "1.0.1-beta.2",
        rollbackTo: "1.0.1-beta.1",
    },
    {
        updateTo: "1.0.1-beta.1",
        rollbackTo: "1.0.1-alpha.1",
    },
];
const breakingPreVersionUpdateTasks = [
    {
        updateTo: "1.0.1-beta.1",
        rollbackTo: "1.0.0",
    },
    // diff = prepatch
    {
        updateTo: "1.0.2-beta.2",
        rollbackTo: "1.0.1-beta.1",
    },
    // diff = preminor
    {
        updateTo: "1.1.0-beta.2",
        rollbackTo: "1.0.1-beta.1",
    },
    // diff = premajor
    {
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
        test("should contain all breaking pre-version updates", () => {
            expect(
                splitUpdateTasks(breakingPreVersionUpdateTasks).breaking
            ).toEqual(breakingPreVersionUpdateTasks);
        });
        test("should not contain non-breaking pre-version updates", () => {
            expect(
                splitUpdateTasks(nonBreakingPreVersionUpdateTasks).breaking
            ).toEqual([]);
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
        test("should contain non-breaking pre-version updates", () => {
            expect(
                splitUpdateTasks(nonBreakingPreVersionUpdateTasks).nonBreaking
            ).toEqual(nonBreakingPreVersionUpdateTasks);
        });
        test("should not contain breaking pre-version updates since they are considered to be unstable", () => {
            expect(
                splitUpdateTasks(breakingPreVersionUpdateTasks).nonBreaking
            ).toEqual([]);
        });
    });
});
