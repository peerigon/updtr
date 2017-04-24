import init from "../../src/tasks/init";
import FakeUpdtr from "../helpers/FakeUpdtr";
import {
    execError,
    npmNoOutdated,
    npmOutdated,
    yarnOutdated,
    errorExecInstallMissing,
    errorExecOutdated,
    errorParseOutdated,
} from "../fixtures/execResults";
import { PackageJsonNoAccessError } from "../../src/errors";

describe("init()", () => {
    describe("when there are no outdated dependencies", () => {
        it("should emit expected events and execute expected commands", async () => {
            const updtr = new FakeUpdtr();

            updtr.execResults = npmNoOutdated;

            await init(updtr);

            expect(updtr.exec.args).toMatchSnapshot();
            expect(updtr.emit.args).toMatchSnapshot();
        });
        it("should return the results as emitted with the 'init/end' event", async () => {
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
            it("should emit expected events and execute expected commands", async () => {
                const updtr = new FakeUpdtr();

                updtr.execResults = npmOutdated;

                await init(updtr);

                expect(updtr.exec.args).toMatchSnapshot();
                expect(updtr.emit.args).toMatchSnapshot();
            });
            it("should return the results as emitted with the 'init/end' event", async () => {
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
            it("should emit expected events and execute expected commands", async () => {
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
        it("should emit expected events and execute expected commands", async () => {
            const updtr = new FakeUpdtr({
                exclude: ["updtr-test-module-1", "updtr-test-module-2"],
            });

            updtr.execResults = npmOutdated;

            await init(updtr);

            expect(updtr.exec.args).toMatchSnapshot();
            expect(updtr.emit.args).toMatchSnapshot();
        });
    });
    describe("when there is no package.json in the cwd", () => {
        it("should throw a PackageJsonNoAccessError", async () => {
            const updtr = new FakeUpdtr();
            let givenErr;

            updtr.canAccessPackageJson.resolves(false);

            try {
                await init(updtr);
            } catch (err) {
                givenErr = err;
            }
            expect(givenErr).toBeInstanceOf(PackageJsonNoAccessError);
        });
    });
    describe("unexpected errors", () => {
        it("should fail when installMissing cmd exits with a non-zero exit code", async () => {
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
        it("should fail when the outdated cmd exits with an exit code above 1", async () => {
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
        it("should fail with a parse error when the stdout could not be parsed", async () => {
            const updtr = new FakeUpdtr();
            let givenErr;

            updtr.execResults = errorParseOutdated;

            try {
                await init(updtr);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr).toBeInstanceOf(SyntaxError);
            expect(givenErr.message).toMatch(
                /Error when trying to parse stdout from command 'npm outdated --json --depth=0': Unexpected token N/
            );
        });
    });
});
