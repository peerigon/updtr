import Updtr from "../../src/Updtr";
import sinon from "sinon";

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
        this.readFile = sinon.stub();
        this.writeFile = sinon.stub();
        this.emit = sinon.stub();
    }
    exec(...args) {
        const currentCall = this.execCounter++;
        const execResult = this.execResults[currentCall];

        this.execArgs.push(args);

        if (execResult === undefined) {
            throw new Error(
                `No execResults for call number ${ currentCall }: ${ args.join("") }`
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
    cwd: "/updtr/test/cwd",
};
