import path from "path";
import exec from "../../src/exec/exec";
import { YARN } from "../../src/constants/config";

const projectPath = path.resolve(__dirname, "..", "..");
const pathToBabelNode = require.resolve(".bin/babel-node");
const pathToRunBin = require.resolve("../helpers/runBinMock");

async function execBin({ cwd = __dirname, args = [] } = {}) {
    const execResult = await exec(
        cwd,
        [pathToBabelNode, pathToRunBin, ...args].join(" ")
    );

    return JSON.parse(execResult.stdout.replace(projectPath, "/"));
}

describe("bin", () => {
    describe("when no arguments have been specified", () => {
        test("should run updtr with the default config", async () => {
            const configs = await execBin();

            expect(configs).toMatchSnapshot();
        });
    });
    describe("when the binary is executed in a directory with a yarn.lock file", () => {
        test("should use yarn", async () => {
            const cwd = path.resolve(__dirname, "..", "fixtures", "empty");
            const configs = await execBin({ cwd });

            expect(configs.updtrConfig.use).toBe(YARN);
        });
    });
    describe("when all arguments have been specified", () => {
        test("should run updtr with the expected config", async () => {
            const args = [
                "--reporter simple",
                "--use yarn",
                "--exclude a b c",
                "--test 'jest -b'",
                // yarn does not support custom registries
                // We don't test for this option here and assume that it'll work if all the other options did also work
                // "--registry http://example.com",
                "--update-to non-breaking",
                "--test-stdout",
                "--save-exact",
            ];
            const configs = await execBin({ args });

            expect(configs).toMatchSnapshot();
        });
    });
});
