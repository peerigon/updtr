import filterUpdateTask from "../../../src/tasks/util/filterUpdateTask";
import { REGULAR } from "../../../src/constants/dependencyTypes";

const baseUpdateTask = {
    name: "some-module",
    type: REGULAR,
    updateTo: "2.0.0",
    rollbackTo: "1.0.0",
};
const baseUpdtrConfig = {
    exclude: [],
};

describe("filterUpdateTask()", () => {
    test("should not filter a regular update task", () => {
        expect(filterUpdateTask(baseUpdateTask, baseUpdtrConfig)).toBe(true);
    });
    describe("exotic dependencies", () => {
        test("should filter git dependencies", () => {
            const updateTask = { ...baseUpdateTask };

            updateTask.updateTo = "git";

            expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                false
            );
        });
        test("should filter exotic dependencies", () => {
            const updateTask = { ...baseUpdateTask };

            updateTask.updateTo = "exotic";

            expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                false
            );
        });
    });
    describe("unstable dependencies", () => {
        test("should filter pre-releases according to semver", () => {
            const updateTask = { ...baseUpdateTask };

            updateTask.updateTo = "2.0.0-alpha";
            expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                false
            );
            updateTask.updateTo = "2.0.0-beta";
            expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                false
            );
            updateTask.updateTo = "2.0.0-some-other-cryptic-thing";
            expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                false
            );
        });
    });
    describe("excluded dependencies", () => {
        test("should honor the given exclude filter", () => {
            const updtrConfig = { ...baseUpdateTask };

            updtrConfig.exclude = [baseUpdateTask.name];
            expect(filterUpdateTask(baseUpdateTask, updtrConfig)).toBe(
                false
            );
        });
    });
    describe("inconsistent update tasks", () => {
        test("should filter if rollbackTo is the same as updateTo", () => {
            const updateTask = { ...baseUpdateTask };

            updateTask.rollbackTo = "2.0.0";
            expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                false
            );
        });
        test("should filter if rollbackTo is greater than updateTo", () => {
            const updateTask = { ...baseUpdateTask };

            updateTask.rollbackTo = "3.0.0";
            expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                false
            );
        });
    });
});
