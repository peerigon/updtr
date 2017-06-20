import { UPDATE_TO_LATEST } from "../../src/constants/config";
import { GIT, EXCLUDED } from "../../src/constants/filterReasons";
import createUpdateTask from "../../src/tasks/util/createUpdateTask";
import outdateds from "../fixtures/outdateds";
import {
    module1ToLatestSuccess,
    module1ToLatestFail,
} from "../fixtures/updateResults";

const cases = {
    "no outdated modules": null,
    "custom config and only excluded modules": null,
    "batch-update success and show test stdout": null,
    "batch-update fail and show test stdout": null,
    "custom config and sequential-update with mixed success and show test stdout": null,
};

export default cases;

beforeAll(() => {
    const updateTasks = outdateds.slice(0, 4).map(outdated =>
        createUpdateTask(outdated, {
            updateTo: UPDATE_TO_LATEST,
        })
    );

    cases["no outdated modules"] = {
        events: [
            [
                "start",
                {
                    config: {},
                },
            ],
            ["init/install-missing", { cmd: "npm install" }],
            ["init/collect", { cmd: "npm outdated" }],
            ["init/end", { updateTasks: [], excluded: [] }],
            ["end", { results: [] }],
        ],
    };
    cases["custom config and only excluded modules"] = {
        events: [
            [
                "start",
                {
                    config: {
                        cwd: __dirname,
                        exclude: ["b", "c"],
                    },
                },
            ],
            ["init/install-missing", { cmd: "npm install" }],
            ["init/collect", { cmd: "npm outdated" }],
            [
                "init/end",
                {
                    updateTasks: [],
                    excluded: [
                        {
                            name: "a",
                            reason: GIT,
                        },
                        {
                            name: "b",
                            reason: EXCLUDED,
                        },
                        {
                            name: "c",
                            reason: EXCLUDED,
                        },
                    ],
                },
            ],
            ["end", { results: [] }],
        ],
    };
    cases["batch-update success and show test stdout"] = {
        reporterConfig: {
            testStdout: true,
        },
        events: [
            ["start", { config: {} }],
            ["init/install-missing", { cmd: "npm install" }],
            ["init/collect", { cmd: "npm outdated" }],
            ["init/end", { updateTasks, excluded: [] }],
            ["batch-update/updating", { updateTasks, cmd: "npm install" }],
            ["batch-update/testing", { updateTasks, cmd: "npm test" }],
            [
                "batch-update/result",
                {
                    updateTasks,
                    success: true,
                    stdout: "This is the test stdout",
                },
            ],
            [
                "end",
                {
                    results: [
                        module1ToLatestSuccess,
                        module1ToLatestSuccess,
                        module1ToLatestSuccess,
                    ],
                },
            ],
        ],
    };
    cases["batch-update fail and show test stdout"] = {
        reporterConfig: {
            testStdout: true,
        },
        events: [
            ["start", { config: {} }],
            ["init/install-missing", { cmd: "npm install" }],
            ["init/collect", { cmd: "npm outdated" }],
            ["init/end", { updateTasks, excluded: [] }],
            ["batch-update/updating", { updateTasks, cmd: "npm install" }],
            ["batch-update/testing", { updateTasks, cmd: "npm test" }],
            ["batch-update/rollback", { updateTasks, cmd: "npm install" }],
            [
                "batch-update/result",
                {
                    updateTasks,
                    success: false,
                    stdout: "This is the test stdout",
                },
            ],
            [
                "end",
                {
                    results: [
                        module1ToLatestSuccess,
                        module1ToLatestFail,
                        module1ToLatestSuccess,
                    ],
                },
            ],
        ],
    };
    cases[
        "custom config and sequential-update with mixed success and show test stdout"
    ] = {
        reporterConfig: {
            testStdout: true,
        },
        events: [
            [
                "start",
                {
                    config: {
                        exclude: ["b", "c"],
                    },
                },
            ],
                ["init/install-missing", { cmd: "npm install" }],
                ["init/collect", { cmd: "npm outdated" }],
                ["init/end", { updateTasks, excluded: [] }],
            ...updateTasks.reduce(
                (events, updateTask, i) =>
                        events.concat(
                            i % 2 === 0 ? // success true or false
                            [
                                [
                                    "sequential-update/updating",
                                    { cmd: "npm install", ...updateTask },
                                ],
                                [
                                    "sequential-update/testing",
                                    { cmd: "npm test", ...updateTask },
                                ],
                                [
                                    "sequential-update/result",
                                    { success: true, ...updateTask },
                                ],
                            ] :
                            [
                                [
                                    "sequential-update/updating",
                                        { cmd: "npm install", ...updateTask },
                                ],
                                [
                                    "sequential-update/testing",
                                        { cmd: "npm test", ...updateTask },
                                ],
                                [
                                    "sequential-update/rollback",
                                    {
                                        cmd: "npm install",
                                        success: false,
                                        ...updateTask,
                                    },
                                ],
                                [
                                    "sequential-update/result",
                                    {
                                        success: false,
                                        stdout: "This is the test stdout",
                                        ...updateTask,
                                    },
                                ],
                            ]
                        ),
                    []
                ),
            [
                "end",
                {
                    results: updateTasks.map(
                        (updateTask, i) =>
                                (i % 2 === 0 ?
                                    module1ToLatestSuccess :
                                    module1ToLatestFail)
                        ),
                },
            ],
        ],
    };
});
