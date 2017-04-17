function lineToString(line) {
    if (Array.isArray(line) === true) {
        return line.join("");
    }

    return String(line);
}

export default class Projector {
    constructor(terminal, frameRate = 10) {
        this.terminal = terminal;
        this.intervalDelay = Math.floor(1000 / frameRate);
        this.intervalId = null;
        this.frame = [];
    }
    start() {
        if (this.intervalId !== null) {
            return;
        }
        this.intervalId = setInterval(
            () => this.terminal.replace(this.frame.map(lineToString)),
            this.intervalDelay
        );
    }
    stop() {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }
}
