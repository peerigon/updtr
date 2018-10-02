import {
    UPDATE_TO_LATEST,
    UPDATE_TO_NON_BREAKING,
} from "../../src/constants/config";
import parse from "../../src/exec/parse";
import createUpdateTask from "../../src/tasks/util/createUpdateTask";
import createUpdateResult from "../../src/tasks/util/createUpdateResult";
import {readFixture} from "../helpers/readFixtures";
import FakeUpdtr from "../helpers/FakeUpdtr";

export let module1ToLatestSuccess;
export let module1ToNonBreakingSuccess;
export let module2ToLatestSuccess;
export let module2ToNonBreakingSuccess;
export let module1ToLatestFail;
export let module1ToNonBreakingFail;
export let module2ToLatestFail;
export let module2ToNonBreakingFail;

function outdatedToUpdateResult(outdated, updateTo, success) {
    return createUpdateResult(
        createUpdateTask(outdated, {
            ...FakeUpdtr.baseConfig,
            updateTo,
        }),
        success
    );
}

beforeAll(async () => {
    const stdoutLog = await readFixture("outdated/outdated.npm.log");
    const [outdatedTestModule1, outdatedTestModule2] = parse.npm.outdated(
        stdoutLog
    );

    module1ToLatestSuccess = outdatedToUpdateResult(
        outdatedTestModule1,
        UPDATE_TO_LATEST,
        true
    );
    module1ToNonBreakingSuccess = outdatedToUpdateResult(
        outdatedTestModule1,
        UPDATE_TO_NON_BREAKING,
        true
    );
    module1ToLatestFail = outdatedToUpdateResult(
        outdatedTestModule1,
        UPDATE_TO_LATEST,
        false
    );
    module1ToNonBreakingFail = outdatedToUpdateResult(
        outdatedTestModule1,
        UPDATE_TO_NON_BREAKING,
        false
    );
    module2ToLatestSuccess = outdatedToUpdateResult(
        outdatedTestModule2,
        UPDATE_TO_LATEST,
        true
    );
    module2ToNonBreakingSuccess = outdatedToUpdateResult(
        outdatedTestModule2,
        UPDATE_TO_NON_BREAKING,
        true
    );
    module2ToLatestFail = outdatedToUpdateResult(
        outdatedTestModule2,
        UPDATE_TO_LATEST,
        false
    );
    module2ToNonBreakingFail = outdatedToUpdateResult(
        outdatedTestModule2,
        UPDATE_TO_NON_BREAKING,
        false
    );
});
