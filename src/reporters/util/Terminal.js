import { EOL } from "os";
import readline from "readline";

function write(stream, lines) {
    if (lines.length > 0) {
        stream.write(lines.join(EOL) + EOL);
    }
}

function resetCursor(stream, numOfLines) {
    if (numOfLines > 0) {
        readline.clearLine(stream, -1);
        readline.moveCursor(stream, 0, -numOfLines);
        readline.clearScreenDown(stream);
    }
}

function updateCursor(terminal, lines) {
    if (lines.length > 0) {
        const lastLine = lines[lines.length - 1];
        const x = lastLine.length;
        const y = lines.length;

        readline.moveCursor(this.stream, -x, -y);
        readline.clearScreenDown(this.stream);
    }
}

export default class Terminal {
    constructor(stream) {
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
