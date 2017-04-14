import readFixtures from "../helpers/readFixtures";
import ExecError from "../helpers/ExecError";

// Using exitCode 2 because this way we can re-use this error also for npm outdated
export const execError = new ExecError({
    message: "Oops",
    exitCode: 2,
    stdout: "Oh noez",
});

export const npmNoOutdated = [];
export const npmOutdated = [];
export const yarnOutdated = [];
export const update = [];
export const testPass = [];
export const testFail = [];
export const npmList = [];
export const yarnList = [];
export const errorExecInstallMissing = [];
export const errorExecOutdated = [];
export const errorParseOutdated = [];
export const errorExecUpdate = [];
export const errorExecRollback = [];
export const errorExecList = [];

beforeAll(async () => {
    const stdoutLogs = await readFixtures([
        "no-outdated/outdated.npm.log",
        "no-outdated/outdated.yarn.log",
        "no-outdated/list.npm.log",
        "no-outdated/list.yarn.log",
        "outdated/outdated.npm.log",
        "outdated/outdated.yarn.log",
    ]);

    npmNoOutdated.push(
        { stdout: "" }, // installMissing
        {
            stdout: stdoutLogs.get("no-outdated/outdated.npm.log"),
        } // outdated
    );

    npmOutdated.push(
        { stdout: "" }, // installMissing
        // npm exits with exit code 1 when there are outdated dependencies
        new ExecError({
            stdout: stdoutLogs.get("outdated/outdated.npm.log"),
            exitCode: 1,
        }) // outdated
    );
    yarnOutdated.push(
        { stdout: "" }, // installMissing
        {
            stdout: stdoutLogs.get("outdated/outdated.yarn.log"),
        } // outdated
    );

    update.push(
        { stdout: "" } // update
    );

    testPass.push(
        { stdout: "Everything ok" } // test
    );
    testFail.push(
        execError, // test
        { stdout: "" } // rollback
    );

    npmList.push({
        stdout: stdoutLogs.get("no-outdated/list.npm.log"),
    });
    yarnList.push({
        stdout: stdoutLogs.get("no-outdated/list.yarn.log"),
    });

    errorExecInstallMissing.push(
        execError // installMissing
    );
    errorExecOutdated.push(
        { stdout: "" }, // installMissing
        execError // outdated
    );
    errorParseOutdated.push(
        { stdout: "" }, // installMissing
        { stdout: "Nonsense" } // outdated
    );
    errorExecUpdate.push(
        execError // update
    );
    errorExecRollback.push(
        { stdout: "" }, // update
        execError, // test
        execError // rollback
    );
    errorExecList.push(
        execError // list
    );
});
