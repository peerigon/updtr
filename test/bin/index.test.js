import { execFile } from "child_process";
import path from "path";
import { USE_YARN } from "../../src/constants/config";

const projectPath = path.resolve(__dirname, "..", "..").replace(/\\/g, "/");
const pathToBabelNode = require.resolve("babel-cli/bin/babel-node");
const pathToRunBin = require.resolve("../helpers/runBinMock");

// These tests may take longer on travis
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

async function execRunBinMock(
    { cwd = __dirname, args = [], runMock = "" } = {}
) {
    const stdout = await new Promise((resolve, reject) => {
        execFile(
            "node",
            [pathToBabelNode, pathToRunBin, ...args],
            {
                cwd,
                env: {
                    ...process.env,
                    RUN_MOCK: runMock,
                },
            },
            (err, stdout, stderr) =>
                void (err ? reject(err) : resolve(stdout || stderr))
        );
    });

    const stdoutWithoutBasePath = stdout
        // Replace double-backslashes with one forward slash
        .replace(/\\\\/g, "/")
        // Remove project path
        .split(projectPath)
        .join("");

    return JSON.parse(stdoutWithoutBasePath);
}

describe("bin", () => {
    describe("when no arguments have been specified", () => {
        it("should run updtr with the default config", async () => {
            const configs = await execRunBinMock();

            expect(configs).toMatchSnapshot();
        });
    });
    describe("when the binary is executed in a directory with a yarn.lock file", () => {
        it("should use yarn", async () => {
            const cwd = path.resolve(__dirname, "..", "fixtures", "empty");
            const configs = await execRunBinMock({ cwd });

            expect(configs.updtrConfig.use).toBe(USE_YARN);
        });
    });
    describe("when all arguments have been specified", () => {
        it("should run updtr with the expected config", async () => {
            const args = [
                "--reporter",
                "dense",
                "--use",
                "yarn",
                "--exclude",
                "a",
                "b",
                "c",
                "--test",
                "jest -b",
                // yarn does not support custom registries
                // We don't test for this option here and assume that it'll work if all the other options did also work
                // "--registry http://example.com",
                "--update-to",
                "non-breaking",
                "--test-stdout",
                "--save",
                "exact",
            ];
            const configs = await execRunBinMock({ args });

            expect(configs).toMatchSnapshot();
        });
    });
    describe("when there is an error", () => {
        it("should emit an error event on the updtr instance", async () => {
            const error = await execRunBinMock({
                runMock: "rejectWithAccessError",
                args: ["--reporter", "error"],
            });

            expect(error).toMatchSnapshot();
        });
    });
});
