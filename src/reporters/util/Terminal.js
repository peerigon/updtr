import { EOL } from "os";
import readline from "readline";

const CSI = "\x1b["; // control sequence initiator
const HIDE_CURSOR = CSI + "?25l";

function write(stream, lines) {
    if (lines.length > 0) {
        stream.write(lines.join(EOL) + EOL);
    }
}

function resetCursor(stream, numOfLines) {
    if (numOfLines > 0) {
        readline.moveCursor(stream, 0, -numOfLines);
    }
}

function setBlocking(stream) {
    if (
        stream._handle &&
        stream.isTTY &&
        typeof stream._handle.setBlocking === "function"
    ) {
        stream._handle.setBlocking(true);
    }
}

export default class Terminal {
    constructor(stream) {
        setBlocking(stream);
        stream.write(HIDE_CURSOR);
        this.stream = stream;
        this.flush();
    }
    replace(lines) {
        resetCursor(this.stream, this.numOfLines);
        write(this.stream, lines);
        this.numOfLines = lines.length;
    }
    append(lines) {
        write(this.stream, lines);
        this.numOfLines += lines.length;
    }
    flush() {
        this.numOfLines = 0;
    }
}
