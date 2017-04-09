import init from "../../src/tasks/init";
import FakeUpdtr from "../helpers/FakeUpdtr";
import {
    ready as execResultsReady,
    execError,
    npmNoOutdated,
    npmOutdated,
    yarnOutdated,
    errorExecInstallMissing,
    errorExecOutdated,
    errorParseOutdated,
} from "../fixtures/execResults";

beforeAll(() => execResultsReady);

describe("init()", () => {
    describe("when there are no outdated dependencies", () => {
        test("should emit expected events and execute expected commands", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmNoOutdated;

            await init(updtr);

            expect(updtr.exec.args).toMatchSnapshot();
            expect(updtr.emit.args).toMatchSnapshot();
        });
        test("should return the results as emitted with the 'init/end' event", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmNoOutdated;

            const returnedResults = await init(updtr);
            const [name, endEvent] = updtr.emit.args.pop();

            expect(name).toBe("init/end");
            // The emitted event has additional properties like the config
            expect(endEvent).toEqual(expect.objectContaining(returnedResults));
        });
    });
    describe("when there are outdated dependencies", () => {
        describe("using npm", () => {
            test("should emit expected events and execute expected commands", async () => {
                const updtr = new FakeUpdtr();

                updtr.execResults = npmOutdated;

                await init(updtr);

                expect(updtr.exec.args).toMatchSnapshot();
                expect(updtr.emit.args).toMatchSnapshot();
            });
            test("should return the results as emitted with the 'init/end' event", async () => {
                const updtr = new FakeUpdtr();

                updtr.execResults = npmOutdated;

                const returnedResults = await init(updtr);
                const [name, endEvent] = updtr.emit.args.pop();

                expect(name).toBe("init/end");
                // The emitted event has additional properties like the config
                expect(endEvent).toEqual(
                    expect.objectContaining(returnedResults)
                );
            });
        });
        describe("using yarn", () => {
            test("should emit expected events and execute expected commands", async () => {
                const updtr = new FakeUpdtr({
                    use: "yarn",
                });

                updtr.execResults = yarnOutdated;

                await init(updtr);

                expect(updtr.exec.args).toMatchSnapshot();
                expect(updtr.emit.args).toMatchSnapshot();
            });
            // We don't test for everything here because we assume that the rest works the same as with npm
        });
    });
    describe("when there are excluded dependencies", () => {
        test("should emit expected events and execute expected commands", async () => {
            const updtr = new FakeUpdtr({
                exclude: ["updtr-test-module-1", "updtr-test-module-2"],
            });

            updtr.execResults = npmOutdated;

            await init(updtr);

            expect(updtr.exec.args).toMatchSnapshot();
            expect(updtr.emit.args).toMatchSnapshot();
        });
    });
    describe("unexpected errors", () => {
        test("should fail when installMissing cmd exits with a non-zero exit code", async () => {
            const updtr = new FakeUpdtr();
            let givenErr;

            updtr.execResults = errorExecInstallMissing;

            try {
                await init(updtr);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toBe(execError);
        });
        test("should fail when the outdated cmd exits with an exit code above 1", async () => {
            const updtr = new FakeUpdtr();
            let givenErr;

            updtr.execResults = errorExecOutdated;

            try {
                await init(updtr);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toBe(execError);
        });
        test("should fail with a parse error when the stdout could not be parsed", async () => {
            const updtr = new FakeUpdtr();
            let givenErr;

            updtr.execResults = errorParseOutdated;

            try {
                await init(updtr);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toBeInstanceOf(SyntaxError);
            expect(givenErr.message).toMatchSnapshot();
        });
    });
});
