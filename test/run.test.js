import {UPDATE_TO_NON_BREAKING} from "../src/constants/config";
import run from "../src/run";
import FakeUpdtr from "./helpers/FakeUpdtr";
import pickEventNames from "./helpers/pickEventNames";
import pickEvents from "./helpers/pickEvents";
import ExecError from "./helpers/ExecError";
import {
    npmNoOutdated,
    update,
    testPass,
    testFailWithRollback,
    npmList,
} from "./fixtures/execResults";
import {outdatedRegular} from "./fixtures/packageJsons";

function npmOutdated({nonBreaking = 0, breaking = 0}) {
    const outdated = {};
    let i;

    for (i = 0; i < nonBreaking; i++) {
        const name = "updtr-test-module-" + (i + 1);

        outdated[name] = {
            current: "2.0.0",
            wanted: "2.1.1",
            latest: "2.1.1",
            location: "node_modules/" + name,
        };
    }
    for (i = 0; i < breaking; i++) {
        const name = "updtr-test-module-" + (i + 1);

        outdated[name] = {
            current: "1.0.0",
            wanted: "1.1.1",
            latest: "2.0.0",
            location: "node_modules/" + name,
        };
    }

    return [
        {stdout: ""}, // installMissing
        // npm exits with exit code 1 when there are outdated dependencies
        new ExecError({
            stdout: JSON.stringify(outdated),
            exitCode: 1,
        }), // outdated
    ];
}

function updateTaskNames(updateTasks) {
    return updateTasks.map(({name}) => name);
}

function addPackageJsonFileStubs(updtr) {
    updtr.readFile.withArgs("package.json").resolves(outdatedRegular);
    updtr.writeFile.withArgs("package.json").resolves();
}

describe("run()", () => {
    it("should emit a start event of expected shape", async () => {
        const updtr = new FakeUpdtr();

        updtr.execResults = npmNoOutdated;

        await run(updtr);

        expect(updtr.emit.args.shift()).toMatchSnapshot("start event");
    });
    it("should emit init sequence events", async () => {
        const updtr = new FakeUpdtr();
        const eventNames = ["init/start", "init/end"];

        updtr.execResults = npmNoOutdated;

        await run(updtr);

        expect(pickEventNames(eventNames, updtr.emit.args)).toEqual(eventNames);
    });
    describe("when there are no outdated dependencies", () => {
        it("should not execute the sequential-update", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmNoOutdated;

            await run(updtr);

            expect(
                pickEventNames(["sequential-update/start"], updtr.emit.args)
            ).toHaveLength(0);
        });
        it("should emit an end event of expected shape and return the results", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmNoOutdated;

            const results = await run(updtr);
            const endEventArgs = updtr.emit.args.pop();

            expect(endEventArgs).toMatchSnapshot("no-outdated > end event");
            expect(results).toBe(endEventArgs[1].results);
        });
    });
    describe("when there is just one non-breaking update", () => {
        it("should run the sequential-update", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated({nonBreaking: 1}).concat(
                update,
                testPass
            );
            addPackageJsonFileStubs(updtr);

            await run(updtr);

            const batchUpdateEvents = pickEvents(
                "batch-update/start",
                updtr.emit.args
            );
            const sequentialUpdateEvent = pickEvents(
                "sequential-update/start",
                updtr.emit.args
            )[0];

            expect(batchUpdateEvents).toHaveLength(0);
            expect(updateTaskNames(sequentialUpdateEvent.updateTasks)).toEqual(["updtr-test-module-1"]);
        });
        it("should emit an end event of expected shape and return the results", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated({nonBreaking: 1}).concat(
                update,
                testPass
            );
            addPackageJsonFileStubs(updtr);

            const results = await run(updtr);
            const endEventArgs = updtr.emit.args.pop();

            expect(endEventArgs).toMatchSnapshot("one-breaking > end event");
            expect(results).toBe(endEventArgs[1].results);
        });
    });
    describe("when there are just breaking updates", () => {
        it("should run the sequential-update for all dependencies", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated({breaking: 2}).concat(
                update,
                testPass,
                update,
                testFailWithRollback
            );
            addPackageJsonFileStubs(updtr);

            await run(updtr);

            const batchUpdateEvents = pickEvents(
                "batch-update/start",
                updtr.emit.args
            );
            const sequentialUpdateEvent = pickEvents(
                "sequential-update/start",
                updtr.emit.args
            )[0];

            expect(batchUpdateEvents).toHaveLength(0);
            expect(updateTaskNames(sequentialUpdateEvent.updateTasks)).toEqual([
                "updtr-test-module-1",
                "updtr-test-module-2",
            ]);
        });
        it("should emit an end event of expected shape and return the results", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated({breaking: 2}).concat(
                update,
                testPass,
                update,
                testFailWithRollback
            );
            addPackageJsonFileStubs(updtr);

            const results = await run(updtr);
            const endEventArgs = updtr.emit.args.pop();

            expect(endEventArgs).toMatchSnapshot(
                "breaking updates > end event"
            );
            expect(results).toBe(endEventArgs[1].results);
        });
    });
    describe("when there are two non-breaking updates and the update is ok", () => {
        it("should only run the batch-update", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated({nonBreaking: 2}).concat(
                update,
                testPass
            );
            addPackageJsonFileStubs(updtr);

            await run(updtr);

            const batchUpdateEvent = pickEvents(
                "batch-update/start",
                updtr.emit.args
            )[0];
            const sequentialUpdateEvents = pickEvents(
                "sequential-update/start",
                updtr.emit.args
            );

            expect(updateTaskNames(batchUpdateEvent.updateTasks)).toEqual([
                "updtr-test-module-1",
                "updtr-test-module-2",
            ]);
            expect(sequentialUpdateEvents).toHaveLength(0);
        });
        it("should emit an end event of expected shape and return the results", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated({nonBreaking: 2}).concat(
                update,
                testPass
            );
            addPackageJsonFileStubs(updtr);

            const results = await run(updtr);
            const endEventArgs = updtr.emit.args.pop();

            expect(endEventArgs).toMatchSnapshot(
                "two non-breaking and update ok > end event"
            );
            expect(results).toBe(endEventArgs[1].results);
        });
    });
    describe("when there are two non-breaking updates and the update is not ok", () => {
        it("should run the batch-update first and back off to the sequential-update", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated({nonBreaking: 2}).concat(
                update,
                testFailWithRollback,
                testFailWithRollback,
                testPass
            );
            addPackageJsonFileStubs(updtr);

            await run(updtr);

            const batchUpdateEvent = pickEvents(
                "batch-update/start",
                updtr.emit.args
            )[0];
            const sequentialUpdateEvent = pickEvents(
                "sequential-update/start",
                updtr.emit.args
            )[0];

            expect(updateTaskNames(batchUpdateEvent.updateTasks)).toEqual([
                "updtr-test-module-1",
                "updtr-test-module-2",
            ]);
            expect(updateTaskNames(sequentialUpdateEvent.updateTasks)).toEqual([
                "updtr-test-module-1",
                "updtr-test-module-2",
            ]);
        });
        it("should emit an end event of expected shape and return the results", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated({nonBreaking: 2}).concat(
                update,
                testFailWithRollback,
                testFailWithRollback,
                testPass
            );
            addPackageJsonFileStubs(updtr);

            const results = await run(updtr);
            const endEventArgs = updtr.emit.args.pop();

            expect(endEventArgs).toMatchSnapshot(
                "two non-breaking and update not ok > end event"
            );
            expect(results).toBe(endEventArgs[1].results);
        });
    });
    describe(`when updateTo is "${UPDATE_TO_NON_BREAKING}"`, () => {
        it("should finish incomplete results", async () => {
            const updtr = new FakeUpdtr({
                updateTo: UPDATE_TO_NON_BREAKING,
            });

            // npm outdated reports a breaking change, but the updateTo option
            // limits the update to a non-breaking version
            updtr.execResults = npmOutdated({breaking: 1}).concat(
                update,
                testPass,
                npmList
            );
            addPackageJsonFileStubs(updtr);

            expect(await run(updtr)).toMatchSnapshot(
                `updateTo ${UPDATE_TO_NON_BREAKING} > end event`
            );
        });
    });
});
