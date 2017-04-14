import { UPDATE_TO_LATEST } from "../../src/constants/config";
import parse from "../../src/exec/parse";
import createUpdateTask from "../../src/tasks/util/createUpdateTask";
import createUpdateResult from "../../src/tasks/util/createUpdateResult";
import { readFixture } from "../helpers/readFixtures";
import FakeUpdtr from "../helpers/FakeUpdtr";

export let module1ToLatestSuccess;
export let module2ToLatestSuccess;
export let module1ToLatestFail;
export let module2ToLatestFail;

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

    module1ToLatestSuccess = outdatedToUpdateResult(outdatedTestModule1, true);
    module1ToLatestFail = outdatedToUpdateResult(outdatedTestModule1, false);
    module2ToLatestSuccess = outdatedToUpdateResult(outdatedTestModule2, true);
    module2ToLatestFail = outdatedToUpdateResult(outdatedTestModule2, false);
});
