function lineToString(line) {
    if (Array.isArray(line) === true) {
        return line.join("");
    }

    return String(line);
}

export default class Projector {
    constructor(terminal, frameRate = 10) {
        this.terminal = terminal;
        this.delay = Math.floor(1000 / frameRate);
        this.timeoutId = null;
    }
    display(frame) {
        if (this.timeoutId !== null) {
            this.terminal.rewind();
            this.stop();
        }
        this.terminal.append(frame.map(lineToString));
        this.timeoutId = setTimeout(() => {
            this.display(frame);
        }, this.delay);
    }
    stop() {
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
    }
}
