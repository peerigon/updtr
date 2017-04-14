import { UPDATE_TO_LATEST } from "../../src/constants/config";
import parse from "../../src/exec/parse";
import createUpdateTask from "../../src/tasks/util/createUpdateTask";
import createUpdateResult from "../../src/tasks/util/createUpdateResult";
import { readFixture } from "../helpers/readFixtures";
import FakeUpdtr from "../helpers/FakeUpdtr";

export let testModule1Success;
export let testModule2Success;
export let testModule1Fail;
export let testModule2Fail;

function outdatedToUpdateResult(outdated, success) {
    return createUpdateResult(
        createUpdateTask(outdated, {
            ...FakeUpdtr.baseConfig,
            updateTo: UPDATE_TO_LATEST,
        }),
        success
    );
}

beforeAll(async () => {
    const stdoutLog = await readFixture("outdated/outdated.npm.log");
    const [outdatedTestModule1, outdatedTestModule2] = parse.npm.outdated(
        stdoutLog
    );

    testModule1Success = outdatedToUpdateResult(outdatedTestModule1, true);
    testModule1Fail = outdatedToUpdateResult(outdatedTestModule1, false);
    testModule2Success = outdatedToUpdateResult(outdatedTestModule2, true);
    testModule2Fail = outdatedToUpdateResult(outdatedTestModule2, false);
});
