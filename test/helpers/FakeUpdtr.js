import path from "path";
import Updtr from "../../src/Updtr";

export default class FakeUpdtr extends Updtr {
    constructor(updtrConfig = {}) {
        super({
            ...FakeUpdtr.baseConfig,
            ...updtrConfig,
        });
        this.emittedEvents = [];
        this.execArgs = [];
        this.execResults = null;
        this.execCounter = 0;
    }
    exec(...args) {
        this.execArgs.push(args);

        const execResult = this.execResults[this.execCounter++];

        if (execResult === undefined) {
            throw new Error(
                "updtr.exec() was called more often than execResults are available"
            );
        }
        if (execResult instanceof Error === true) {
            return Promise.reject(execResult);
        }

        return Promise.resolve(execResult);
    }
    emit(...args) {
        this.emittedEvents.push(args);
    }
}

FakeUpdtr.baseConfig = {
    cwd: path.resolve(__dirname, ".."),
};
