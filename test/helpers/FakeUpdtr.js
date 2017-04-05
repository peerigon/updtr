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

        return this.execResults[this.execCounter++];
    }
    emit(...args) {
        this.emittedEvents.push(args);
    }
}

FakeUpdtr.baseConfig = {
    cwd: path.resolve(__dirname, ".."),
};
