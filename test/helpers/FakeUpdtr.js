import sinon from "sinon";
import Updtr from "../../src/Updtr";

export default class FakeUpdtr extends Updtr {
    constructor(updtrConfig = {}) {
        super({
            ...FakeUpdtr.baseConfig,
            ...updtrConfig,
        });
        this.readFile = sinon.stub();
        this.writeFile = sinon.stub();
        this.emit = sinon.stub();
        this.exec = sinon.stub();
    }
    set execResults(execResults) {
        execResults.forEach((execResult, index) => {
            const call = this.exec.onCall(index);

            if (execResult instanceof Error) {
                call.rejects(execResult);
            } else {
                call.resolves(execResult);
            }
        });
    }
}

FakeUpdtr.baseConfig = {
    cwd: "/updtr/test/cwd",
};
