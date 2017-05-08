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

describe("createUpdateTask()", () => {
    it("should return a valid update task", () => {
        expect(
            createUpdateTask(outdateds[0], {
                ...FakeUpdtr.baseConfig,
                updateTo: UPDATE_TO_LATEST,
            })
        ).toMatchSnapshot();
    });
    describe(`when updateTo is "${ UPDATE_TO_LATEST }"`, () => {
        outdateds.forEach(outdated => {
            it(`when given ${ stringify(outdated) } should update to ${ outdated.latest } and rollback to ${ outdated.current }`, () => {
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

            it(`when given ${ stringify(outdated) } should update to ${ range } and rollback to ${ outdated.current }`, () => {
                const updateTask = createUpdateTask(outdated, {
                    ...FakeUpdtr.baseConfig,
                    updateTo: UPDATE_TO_NON_BREAKING,
                });

                expect(updateTask.updateTo).toBe(range);
                expect(updateTask.rollbackTo).toBe(outdated.current);
            });
        });
    });
    describe(`when updateTo is "${ UPDATE_TO_WANTED }"`, () => {
        outdateds.forEach(outdated => {
            it(`when given ${ stringify(outdated) } should update to ${ outdated.wanted } and rollback to ${ outdated.current }`, () => {
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
