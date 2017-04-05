export default class ExecError extends Error {
    constructor({ message, stdout = "", stderr = "", exitCode }) {
        super(message);
        this.stdout = stdout;
        this.stderr = stderr;
        this.code = exitCode;
    }
}
