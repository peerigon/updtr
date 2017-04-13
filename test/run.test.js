import run from "../src/run";
import FakeUpdtr from "./helpers/FakeUpdtr";
import pickEventNames from "./helpers/pickEventNames";
import pickEvents from "./helpers/pickEvents";
import ExecError from "./helpers/ExecError";
import {
    npmNoOutdated,
    update,
    testPass,
    testFail,
} from "./fixtures/execResults";
import { outdatedRegular } from "./fixtures/packageJsons";

function npmOutdated({ nonBreaking = 0, breaking = 0 }) {
    const outdated = {};
    let i;

    for (i = 0; i < nonBreaking; i++) {
        const name = "updtr-test-module-" + i;

        outdated[name] = {
            current: "2.0.0",
            wanted: "2.1.1",
            latest: "2.1.1",
            location: "node_modules/" + name,
        };
    }
    for (i = 0; i < breaking; i++) {
        const name = "updtr-test-module-" + i;

        outdated[name] = {
            current: "1.0.0",
            wanted: "1.1.1",
            latest: "2.0.0",
            location: "node_modules/" + name,
        };
    }

    return [
        { stdout: "" }, // installMissing
        // npm exits with exit code 1 when there are outdated dependencies
        new ExecError({
            stdout: JSON.stringify(outdated),
            exitCode: 1,
        }), // outdated
    ];
}

function updateTaskNames(updateTasks) {
    return updateTasks.map(({ name }) => name);
}

function addPackageJsonFileStubs(updtr) {
    updtr.readFile.withArgs("package.json").resolves(outdatedRegular);
    updtr.writeFile.withArgs("package.json").resolves();
}

describe("run()", () => {
    test("should emit a start event of expected shape", async () => {
        const updtr = new FakeUpdtr();

        updtr.execResults = npmNoOutdated;

        await run(updtr);

        expect(updtr.emit.args.shift()).toMatchSnapshot();
    });
    test("should emit init sequence events", async () => {
        const updtr = new FakeUpdtr();
        const eventNames = ["init/start", "init/end"];

        updtr.execResults = npmNoOutdated;

        await run(updtr);

        expect(pickEventNames(eventNames, updtr.emit.args)).toEqual(eventNames);
    });
    describe("when there are no outdated dependencies", () => {
        test("should not execute the sequential-update", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmNoOutdated;

            await run(updtr);

            expect(
                pickEventNames(["sequential-update/start"], updtr.emit.args)
            ).toHaveLength(0);
        });
        test("should emit an end event of expected shape and return the results", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmNoOutdated;

            const results = await run(updtr);
            const endEventArgs = updtr.emit.args.pop();

            expect(endEventArgs).toMatchSnapshot();
            expect(results).toBe(endEventArgs[1].results);
        });
    });
    describe("when there is just one non-breaking update", () => {
        test("should run the sequential-update", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated({ nonBreaking: 1 }).concat(
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
            expect(updateTaskNames(sequentialUpdateEvent.updateTasks)).toEqual([
                "updtr-test-module-0",
            ]);
        });
        test("should emit an end event of expected shape and return the results", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated({ nonBreaking: 1 }).concat(
                update,
                testPass
            );
            addPackageJsonFileStubs(updtr);

            const results = await run(updtr);
            const endEventArgs = updtr.emit.args.pop();

            expect(endEventArgs).toMatchSnapshot();
            expect(results).toBe(endEventArgs[1].results);
        });
    });
    describe("when there are just breaking updates", () => {
        test("should run the sequential-update for all dependencies", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated({ breaking: 2 }).concat(
                update,
                testPass,
                update,
                testFail
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
                "updtr-test-module-0",
                "updtr-test-module-1",
            ]);
        });
        test("should emit an end event of expected shape and return the results", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated({ breaking: 2 }).concat(
                update,
                testPass,
                update,
                testFail
            );
            addPackageJsonFileStubs(updtr);

            const results = await run(updtr);
            const endEventArgs = updtr.emit.args.pop();

            expect(endEventArgs).toMatchSnapshot();
            expect(results).toBe(endEventArgs[1].results);
        });
    });
    describe("when there are two non-breaking updates and the update is ok", () => {
        test("should only run the batch-update", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated({ nonBreaking: 2 }).concat(
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
                "updtr-test-module-0",
                "updtr-test-module-1",
            ]);
            expect(sequentialUpdateEvents).toHaveLength(0);
        });
        test("should emit an end event of expected shape and return the results", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated({ nonBreaking: 2 }).concat(
                update,
                testPass
            );
            addPackageJsonFileStubs(updtr);

            const results = await run(updtr);
            const endEventArgs = updtr.emit.args.pop();

            expect(endEventArgs).toMatchSnapshot();
            expect(results).toBe(endEventArgs[1].results);
        });
    });
    describe("when there are two non-breaking updates and the update is not ok", () => {
        test("should run the batch-update first and back off to the sequential-update", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated({ nonBreaking: 2 }).concat(
                update,
                testFail,
                update,
                testFail,
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
                "updtr-test-module-0",
                "updtr-test-module-1",
            ]);
            expect(updateTaskNames(sequentialUpdateEvent.updateTasks)).toEqual([
                "updtr-test-module-0",
                "updtr-test-module-1",
            ]);
        });
        test("should emit an end event of expected shape and return the results", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmOutdated({ nonBreaking: 2 }).concat(
                update,
                testFail,
                update,
                testFail,
                testPass
            );
            addPackageJsonFileStubs(updtr);

            const results = await run(updtr);
            const endEventArgs = updtr.emit.args.pop();

            expect(endEventArgs).toMatchSnapshot();
            expect(results).toBe(endEventArgs[1].results);
        });
    });
});
