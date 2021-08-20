import {stub} from "sinon";
import Updtr from "../../src/Updtr";

export default class FakeUpdtr extends Updtr {
    constructor(updtrConfig = {}) {
        super({
            ...FakeUpdtr.baseConfig,
            ...updtrConfig,
        });
        this.canAccessPackageJson = stub();
        this.readFile = stub();
        this.writeFile = stub();
        this.emit = stub();
        this._exec = stub();
        this.exec.args = this._exec.args;

        this.canAccessPackageJson.resolves(true);
    }

    set execResults(execResults) {
        execResults.forEach((execResult, index) => {
            const call = this._exec.onCall(index);

            if (execResult instanceof Error) {
                call.rejects(execResult);
            } else {
                call.resolves(execResult);
            }
        });
    }

    async exec(...args) {
        const result = await this._exec(...args);

        if (result === undefined) {
            throw new Error("Not enough execResults for FakeUpdtr");
        }

        return result;
    }
}

FakeUpdtr.baseConfig = {
    cwd: "/updtr/test/cwd",
};
