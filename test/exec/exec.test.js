import exec from "../../src/exec/exec";

const logMemoryCode = (() => {
    const DEFAULT_STDOUT_BUFFER_SIZE = 200 * 1024;
    const size = DEFAULT_STDOUT_BUFFER_SIZE + 1;
    const memory = typeof Buffer.allocUnsafe === "function" ?
        Buffer.allocUnsafe(size) :
        new Buffer(size);

    console.log(memory.toString("utf8"));
})
    .toString()
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, "");

const logOkCmd = 'node -e "console.log(\\"ok\\")"';
const noopCmd = 'node -e ""';
const throwCmd = "node -e \"throw 'fail'\"";
const logMemoryCmd = `node -e "(${ logMemoryCode })()"`;
const cwd = __dirname;

describe("exec()", () => {
    it("should return a promise that resolves to an object of expected shape", async () => {
        const result = await exec(cwd, noopCmd);

        expect(result).toMatchSnapshot();
    });
    it("should return a promise that resolves to a value that contains the stdout", async () => {
        const result = await exec(cwd, logOkCmd);

        expect(result.stdout).toBe("ok\n");
    });
    it("should not fail with 'stdout maxBuffer exceeded' if stdout is pretty big", async () => {
        await exec(cwd, logMemoryCmd);
    });
    describe("when the command fails", () => {
        it("should reject the promise with an error of expected shape", async () => {
            let givenErr;

            try {
                await exec(cwd, throwCmd);
            } catch (err) {
                givenErr = err;
            }

            expect(givenErr.message).toContain(throwCmd);
            expect(givenErr).toHaveProperty("stdout");
            expect(givenErr).toHaveProperty("stderr");
            expect(givenErr.stderr).toMatch(/throw 'fail'/);
        });
    });
});
