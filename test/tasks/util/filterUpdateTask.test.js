import filterUpdateTask from "../../../src/tasks/util/filterUpdateTask";
import {
    GIT,
    UNSTABLE,
    NOT_WANTED,
    EXCLUDED,
    EXOTIC,
} from "../../../src/constants/filterReasons";
import {
    isUpdateToNonBreaking,
} from "../../../src/tasks/util/createUpdateTask";

const baseUpdateTask = {
    name: "some-module",
    updateTo: "2.0.0",
    rollbackTo: "1.0.0",
};
const baseUpdtrConfig = {
    exclude: [],
};

describe("filterUpdateTask()", () => {
    it("should not filter a regular update task", () => {
        expect(filterUpdateTask(baseUpdateTask, baseUpdtrConfig)).toBe(null);
    });
    it("should not filter an update task that satisfies the isUpdateToNonBreaking test", () => {
        const updateTask = {...baseUpdateTask, updateTo: "^1.0.0"};

        expect(isUpdateToNonBreaking(updateTask)).toBe(true); // sanity check
        expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(null);
    });
    describe("excluded dependencies", () => {
        it("should honor the given exclude filter", () => {
            const updtrConfig = {...baseUpdateTask};

            updtrConfig.exclude = [baseUpdateTask.name];
            expect(filterUpdateTask(baseUpdateTask, updtrConfig)).toBe(
                EXCLUDED
            );
        });
    });
    describe("git dependencies", () => {
        it("should filter git dependencies", () => {
            const updateTask = {...baseUpdateTask};

            updateTask.updateTo = "git";

            expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(GIT);
        });
    });
    describe("exotic dependencies", () => {
        it("should filter exotic dependencies", () => {
            const updateTask = {...baseUpdateTask};

            updateTask.updateTo = "exotic";

            expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(EXOTIC);
        });
    });
    describe("not wanted", () => {
        it("should filter if rollbackTo is the same as updateTo", () => {
            const updateTask = {...baseUpdateTask};

            updateTask.rollbackTo = "2.0.0";
            expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                NOT_WANTED
            );
            updateTask.rollbackTo = "2.0.0-beta.1";
            updateTask.updateTo = "2.0.0-beta.1";
            expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                NOT_WANTED
            );
        });
        it("should filter if rollbackTo is greater than updateTo", () => {
            const updateTask = {...baseUpdateTask};

            updateTask.rollbackTo = "3.0.0";
            expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                NOT_WANTED
            );
            updateTask.rollbackTo = "3.0.0-beta.1";
            expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                NOT_WANTED
            );
        });
    });
    describe("unstable dependencies", () => {
        describe("when the current version is not a pre-release", () => {
            it("should filter pre-releases", () => {
                const updateTask = {...baseUpdateTask};

                updateTask.updateTo = "2.0.0-alpha.1";
                expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                    UNSTABLE
                );
                updateTask.updateTo = "2.0.0-beta.1";
                expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                    UNSTABLE
                );
                updateTask.updateTo = "2.0.0-some-other-cryptic-thing";
                expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                    UNSTABLE
                );
            });
        });
        describe("when the current version is a pre-release within the same version range", () => {
            it("should not filter pre-releases", () => {
                const updateTask = {
                    ...baseUpdateTask,
                    rollbackTo: "1.0.0-alpha.1",
                };

                updateTask.updateTo = "1.0.0-alpha.2";
                expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                    null
                );
                updateTask.updateTo = "1.0.0-beta.2";
                expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                    null
                );
            });
        });
        describe("when the current version is a pre-release not in the same version range", () => {
            it("should filter pre-releases", () => {
                const updateTask = {
                    ...baseUpdateTask,
                    rollbackTo: "1.0.0-beta.1",
                };

                updateTask.updateTo = "1.1.0-alpha.1";
                expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                    UNSTABLE
                );
                updateTask.updateTo = "2.0.0-beta.1";
                expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                    UNSTABLE
                );
                updateTask.updateTo = "2.0.0-some-other-cryptic-thing";
                expect(filterUpdateTask(updateTask, baseUpdtrConfig)).toBe(
                    UNSTABLE
                );
            });
        });
    });
});
