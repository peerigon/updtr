import { EOL } from "os";
import readline from "readline";
import { cursor, erase } from "ansi-escape-sequences";

const newLine = erase.inLine() + EOL;

function write(stream, lines) {
    if (lines.length > 0) {
        stream.write(lines.join(newLine) + EOL + erase.display());
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
        stream.write(cursor.hide);
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
