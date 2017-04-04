"use strict";

const filterUpdateTask = require("../../../src/tasks/util/filterUpdateTask");
const dependencyTypes = require("../../../src/constants/dependencyTypes");

const baseUpdateTask = {
    name: "some-module",
    type: dependencyTypes.REGULAR,
    updateTo: "2.0.0",
    rollbackTo: "1.0.0",
};
const baseInstanceConfig = {
    exclude: [],
};

describe("filterUpdateTask()", () => {
    test("should not filter a regular update task", () => {
        expect(filterUpdateTask(baseUpdateTask, baseInstanceConfig)).toBe(true);
    });
    describe("exotic dependencies", () => {
        test("should filter git dependencies", () => {
            const updateTask = Object.assign({}, baseUpdateTask);

            updateTask.updateTo = "git";

            expect(filterUpdateTask(updateTask, baseInstanceConfig)).toBe(
                false
            );
        });
        test("should filter exotic dependencies", () => {
            const updateTask = Object.assign({}, baseUpdateTask);

            updateTask.updateTo = "exotic";

            expect(filterUpdateTask(updateTask, baseInstanceConfig)).toBe(
                false
            );
        });
    });
    describe("unstable dependencies", () => {
        test("should filter pre-releases according to semver", () => {
            const updateTask = Object.assign({}, baseUpdateTask);

            updateTask.updateTo = "2.0.0-alpha";
            expect(filterUpdateTask(updateTask, baseInstanceConfig)).toBe(
                false
            );
            updateTask.updateTo = "2.0.0-beta";
            expect(filterUpdateTask(updateTask, baseInstanceConfig)).toBe(
                false
            );
            updateTask.updateTo = "2.0.0-some-other-cryptic-thing";
            expect(filterUpdateTask(updateTask, baseInstanceConfig)).toBe(
                false
            );
        });
    });
    describe("excluded dependencies", () => {
        test("should honor the given exclude filter", () => {
            const instanceConfig = Object.assign({}, baseInstanceConfig);

            instanceConfig.exclude = [baseUpdateTask.name];
            expect(filterUpdateTask(baseUpdateTask, instanceConfig)).toBe(
                false
            );
        });
    });
    describe("inconsistent update tasks", () => {
        test("should filter if rollbackTo is the same as updateTo", () => {
            const updateTask = Object.assign({}, baseUpdateTask);

            updateTask.rollbackTo = "2.0.0";
            expect(filterUpdateTask(updateTask, baseInstanceConfig)).toBe(
                false
            );
        });
        test("should filter if rollbackTo is greater than updateTo", () => {
            const updateTask = Object.assign({}, baseUpdateTask);

            updateTask.rollbackTo = "3.0.0";
            expect(filterUpdateTask(updateTask, baseInstanceConfig)).toBe(
                false
            );
        });
    });
});
