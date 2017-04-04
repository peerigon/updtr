import os from "os";
import exec from "../../src/exec/exec";

const logOkCmd = "node -e 'console.log(\"ok\")'";
const noopCmd = "node -e ''";
const throwCmd = "node -e 'throw \"fail\"'";
const logMemoryCmd = `node -e '(${ logMemory.toString() })()'`;
const cwd = __dirname;

function logMemory() {
    const DEFAULT_STDOUT_BUFFER_SIZE = 200 * 1024;
    const size = DEFAULT_STDOUT_BUFFER_SIZE + 1;
    const memory = typeof Buffer.allocUnsafe === "function" ?
        Buffer.allocUnsafe(size) :
        new Buffer(size);

    console.log(memory.toString("utf8"));
}

describe("exec()", () => {
    test("should return a promise that resolves to an object of expected shape", () =>
        exec(cwd, noopCmd).then(result => expect(result).toMatchSnapshot()));
    test("should return a promise that resolves to a value that contains the stdout", () =>
        exec(cwd, logOkCmd).then(result =>
            expect(result.stdout).toBe("ok" + os.EOL)));
    test("should not fail with 'stdout maxBuffer exceeded' if stdout is pretty big", () =>
        exec(cwd, logMemoryCmd));
    describe("when the command fails", () => {
        test.only(
            "should reject the promise with an error of expected shape",
            () =>
                exec(cwd, throwCmd).then(
                    () => {
                        throw new Error("Should not resolve");
                    },
                    err => expect(err).toMatchSnapshot()
                )
        );
    });
});
