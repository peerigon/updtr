import cliSpinners from "cli-spinners";

const isWin = process.platform === "win32";
const winFallback = "simpleDotsScrolling";

export default class Spinner {
    constructor(spinnerName) {
        const spinner = cliSpinners[isWin === true ? winFallback : spinnerName];

        this.frames = spinner.frames;
        this.interval = spinner.interval;
        this.length = Math.max(...this.frames.map(frame => frame.length));
    }
    valueOf() {
        const currentInterval = Math.floor(Date.now() / this.interval);
        const currentFrame = currentInterval % this.frames.length;

        return this.frames[currentFrame];
    }
    toString() {
        return this.valueOf();
    }
}
