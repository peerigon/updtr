import EventEmitter from "events";
import { WritableStreamBuffer } from "stream-buffers";
import dense from "../../src/reporters/dense";
import Spinner from "../../src/reporters/util/Spinner";
import createUpdateTask from "../../src/tasks/util/createUpdateTask";
import FakeUpdtr from "../helpers/FakeUpdtr";
import outdateds from "../fixtures/outdateds";
import { UPDATE_TO_LATEST } from "../../src/constants/config";

function setup(reporterConfig = {}) {
    const updtr = new EventEmitter();
    const stdout = new WritableStreamBuffer();

    reporterConfig.stream = stdout;
    dense(updtr, reporterConfig);

    return {
        updtr,
        stdout,
    };
}

beforeAll(() => {
    // We need to replace the spinner with a static string to make snapshot testing
    // consistent across platforms.
    Spinner.prototype.valueOf = () => "...";
});

describe("dense()", () => {
    describe("on start", () => {
        describe("with a default config", () => {
            it("should log nothing visible", () => {
                const { updtr, stdout } = setup();

                updtr.emit("start", { config: {} });
                expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                    "start > default config"
                );
            });
        });
        describe("with a custom config", () => {
            it("should log the custom config", () => {
                const { updtr, stdout } = setup();

                updtr.emit("start", {
                    config: {
                        exclude: ["a", "b", "c"],
                        use: "yarn",
                    },
                });
                expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                    "start > custom config"
                );
            });
        });
    });
    describe("on init", () => {
        it("should print the expected lines", () => {
            const { updtr, stdout } = setup();

            updtr.emit("init/install-missing", {
                cmd: "npm install",
            });
            expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                "init/install-missing"
            );
            updtr.emit("init/collect", {
                cmd: "npm outdated",
            });
            expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                "init/collect"
            );
            // Finish sequence to stop the projector timeout
            updtr.emit("init/end", { updateTasks: [], excluded: [] });
        });
        describe("/end with updateTasks.length = 0 and excluded.length = 0", () => {
            it("should print the expected lines", () => {
                const { updtr, stdout } = setup();

                updtr.emit("init/end", { updateTasks: [], excluded: [] });
                expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                    "init/end updateTasks.length = 0 and excluded.length = 0"
                );
            });
        });
        describe("/end with updateTasks.length = 0 and excluded.length > 0", () => {
            it("should print the expected lines", () => {
                const { updtr, stdout } = setup();

                updtr.emit("init/end", {
                    updateTasks: [],
                    excluded: new Array(1),
                });
                expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                    "init/end updateTasks.length = 0 and excluded.length > 0"
                );
            });
        });
        describe("/end with updateTasks.length > 0", () => {
            it("should print the expected lines", () => {
                const { updtr, stdout } = setup();

                updtr.emit("init/end", {
                    updateTasks: new Array(1),
                    excluded: [],
                });
                expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                    "init/end updateTasks.length > 0"
                );
                // Pluralization test
                updtr.emit("init/end", {
                    updateTasks: new Array(2),
                    excluded: [],
                });
                expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                    "init/end updateTasks.length > 0"
                );
            });
        });
    });
    describe("batch-update", () => {
        const updateTasks = outdateds.slice(0, 2).map(outdated =>
            createUpdateTask(outdated, {
                updateTo: UPDATE_TO_LATEST,
            })
        );

        it("should print the expected lines", () => {
            const { updtr, stdout } = setup();

            updtr.emit("batch-update/updating", {
                cmd: "npm install",
                updateTasks,
            });
            expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                "batch-update/updating"
            );
            updtr.emit("batch-update/testing", {
                cmd: "npm test",
                updateTasks,
            });
            expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                "batch-update/testing"
            );
            updtr.emit("batch-update/rollback", {
                cmd: "npm install",
                updateTasks,
            });
            expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                "batch-update/testing"
            );
            // Finish sequence to stop the projector timeout
            updtr.emit("batch-update/result", { success: true, updateTasks });
        });
        describe("/end with success true", () => {
            it("should print the expected lines", () => {
                const { updtr, stdout } = setup();

                updtr.emit("batch-update/result", {
                    success: true,
                    updateTasks,
                });
                expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                    "batch-update/end > success = true"
                );
            });
        });
        describe("/end with success false", () => {
            it("should print the expected lines", () => {
                const { updtr, stdout } = setup();

                updtr.emit("batch-update/result", {
                    success: false,
                    updateTasks,
                });
                expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                    "batch-update/end > success = false"
                );
            });
        });
    });
    describe("sequential-update", () => {
        const updateTasks = outdateds.slice(0, 2).map(outdated =>
            createUpdateTask(outdated, {
                updateTo: UPDATE_TO_LATEST,
            })
        );

        it("should print the expected lines", () => {
            const { updtr, stdout } = setup();

            updtr.emit("sequential-update/updating", {
                cmd: "npm install",
                ...updateTasks[0],
            });
            expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                "sequential-update/updating"
            );
            updtr.emit("sequential-update/testing", {
                cmd: "npm test",
                ...updateTasks[0],
            });
            expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                "sequential-update/testing"
            );
            updtr.emit("sequential-update/rollback", {
                cmd: "npm install",
                ...updateTasks[0],
            });
            expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                "sequential-update/rollback"
            );
            updtr.emit("sequential-update/result", {
                cmd: "npm install",
                success: true,
                ...updateTasks[0],
            });
            expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                "sequential-update/updating 2. event"
            );
            updtr.emit("sequential-update/updating", {
                cmd: "npm install",
                ...updateTasks[0],
            });
            expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                "sequential-update/updating 2. event"
            );
            // Finish sequence to stop the projector timeout
            updtr.emit("sequential-update/result", {
                success: true,
                updateTasks,
            });
        });
        describe.skip("/end with success true", () => {
            it("should print the expected lines", () => {
                const { updtr, stdout } = setup();

                updtr.emit("batch-update/result", {
                    success: true,
                    updateTasks,
                });
                expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                    "batch-update/end > success = true"
                );
            });
        });
        describe.skip("/end with success false", () => {
            it("should print the expected lines", () => {
                const { updtr, stdout } = setup();

                updtr.emit("batch-update/result", {
                    success: false,
                    updateTasks,
                });
                expect(stdout.getContentsAsString("utf8")).toMatchSnapshot(
                    "batch-update/end > success = false"
                );
            });
        });
    });
});
