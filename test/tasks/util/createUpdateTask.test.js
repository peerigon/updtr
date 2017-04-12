import semver from "semver";
import createUpdateTask from "../../../src/tasks/util/createUpdateTask";
import {
    UPDATE_TO_LATEST,
    UPDATE_TO_NON_BREAKING,
    UPDATE_TO_WANTED,
} from "../../../src/constants/config";
import FakeUpdtr from "../../helpers/FakeUpdtr";
import outdateds from "../../fixtures/outdateds";

function stringify(outdated) {
    return [
        "current " + outdated.current,
        "wanted " + outdated.wanted,
        "latest " + outdated.latest,
    ].join(", ");
}

expect.extend({
    toSatisfySemver(received, argument) {
        const pass = semver.satisfies(received, argument);

        if (pass === true) {
            return {
                message: () =>
                    `expected ${ received } not to satisfy ${ argument }`,
                pass,
            };
        }

        return {
            message: () => `expected ${ received } to satisfy ${ argument }`,
            pass,
        };
    },
});

describe("createUpdateTask()", () => {
    test("should return a valid update task", () => {
        expect(
            createUpdateTask(outdateds[0], {
                ...FakeUpdtr.baseConfig,
                updateTo: UPDATE_TO_LATEST,
            })
        ).toMatchSnapshot();
    });
    describe(`when updateTo is "${ UPDATE_TO_LATEST }"`, () => {
        outdateds.forEach(outdated => {
            test(`when given ${ stringify(outdated) } should update to ${ outdated.latest } and rollback to ${ outdated.current }`, () => {
                const updateTask = createUpdateTask(outdated, {
                    ...FakeUpdtr.baseConfig,
                    updateTo: UPDATE_TO_LATEST,
                });

                expect(updateTask.updateTo).toBe(outdated.latest);
                expect(updateTask.rollbackTo).toBe(outdated.current);
            });
        });
    });
    describe(`when updateTo is "${ UPDATE_TO_NON_BREAKING }"`, () => {
        outdateds.forEach(outdated => {
            const range = "^" + outdated.current;

            test(`when given ${ stringify(outdated) } should return an update that satisfies ${ range } and rollback to ${ outdated.current }`, () => {
                const updateTask = createUpdateTask(outdated, {
                    ...FakeUpdtr.baseConfig,
                    updateTo: UPDATE_TO_NON_BREAKING,
                });

                expect(updateTask.updateTo).toSatisfySemver(range);
                expect(updateTask.rollbackTo).toBe(outdated.current);
            });
        });
    });
    describe(`when updateTo is "${ UPDATE_TO_WANTED }"`, () => {
        outdateds.forEach(outdated => {
            test(`when given ${ stringify(outdated) } should update to ${ outdated.wanted } and rollback to ${ outdated.current }`, () => {
                const updateTask = createUpdateTask(outdated, {
                    ...FakeUpdtr.baseConfig,
                    updateTo: UPDATE_TO_WANTED,
                });

                expect(updateTask.updateTo).toBe(outdated.wanted);
                expect(updateTask.rollbackTo).toBe(outdated.current);
            });
        });
    });
});
