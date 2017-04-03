"use strict";

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

describe("filterUpdateTask()", () => {
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
        test("should filter exotic dependencies", () => {
            const updateTask = Object.assign({}, baseUpdateTaskMock);

            updateTask.updateTo = "exotic";

            expect(filterUpdateTask(updateTask, baseInstanceConfigMock)).toBe(
                false
            );
        });
    });
    describe("unstable dependencies", () => {
        test("should filter pre-releases according to semver", () => {
            const updateTask = Object.assign({}, baseUpdateTaskMock);

            updateTask.updateTo = "2.0.0-alpha";
            expect(filterUpdateTask(updateTask, baseInstanceConfigMock)).toBe(
                false
            );
            updateTask.updateTo = "2.0.0-beta";
            expect(filterUpdateTask(updateTask, baseInstanceConfigMock)).toBe(
                false
            );
            updateTask.updateTo = "2.0.0-some-other-cryptic-thing";
            expect(filterUpdateTask(updateTask, baseInstanceConfigMock)).toBe(
                false
            );
        });
    });
    describe("excluded dependencies", () => {
        test("should honor the given exclude filter", () => {
            const updateTask = Object.assign({}, baseUpdateTaskMock);
            const instanceConfig = Object.assign({}, baseInstanceConfigMock);

            instanceConfig.exclude = [updateTask.name];
            expect(filterUpdateTask(updateTask, instanceConfig)).toBe(false);
        });
    });
    describe("inconsistent update tasks", () => {
        test("should filter if rollbackTo is the same as updateTo", () => {
            const updateTask = Object.assign({}, baseUpdateTaskMock);

            updateTask.rollbackTo = "2.0.0";
            expect(filterUpdateTask(updateTask, baseInstanceConfigMock)).toBe(
                false
            );
        });
        test("should filter if rollbackTo is greater than updateTo", () => {
            const updateTask = Object.assign({}, baseUpdateTaskMock);

            updateTask.rollbackTo = "3.0.0";
            expect(filterUpdateTask(updateTask, baseInstanceConfigMock)).toBe(
                false
            );
        });
    });
});
