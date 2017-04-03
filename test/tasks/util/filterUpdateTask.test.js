const filterUpdateTask = require("../../../lib/tasks/util/filterUpdateTask");
const dependencyTypes = require("../../../lib/dependencyTypes");

const baseUpdateTaskMock = {
    name: "some-module",
    type: dependencyTypes.REGULAR,
    updateTo: "2.0.0",
    rollbackTo: "1.0.0",
};
const baseInstanceConfigMock = {
    exclude: [],
};

describe("filterUpdateTask", () => {
    test("should not filter a regular update task", () => {
        const updateTask = Object.assign({}, baseUpdateTaskMock);

        expect(filterUpdateTask(updateTask, baseInstanceConfigMock)).toBe(true);
    });
    describe("exotic dependencies", () => {
        test("should filter git dependencies", () => {
            const updateTask = Object.assign({}, baseUpdateTaskMock);

            updateTask.updateTo = "git";

            expect(filterUpdateTask(updateTask, baseInstanceConfigMock)).toBe(
                false
            );
        });
        test("should filter git dependencies", () => {
            const updateTask = Object.assign({}, baseUpdateTaskMock);

            updateTask.updateTo = "exotic";

            expect(filterUpdateTask(updateTask, baseInstanceConfigMock)).toBe(
                false
            );
        });
    });
});
