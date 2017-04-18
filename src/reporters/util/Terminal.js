import { EOL } from "os";
import { cursor, erase } from "ansi-escape-sequences";

const newLine = erase.inLine() + EOL;

function linesToString(lines) {
    if (lines.length > 0) {
        return lines.join(newLine) + newLine + erase.display();
    }

    return "";
}

function resetCursor(numOfLines) {
    if (numOfLines > 0) {
        return cursor.up(numOfLines);
    }

    return "";
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
        this.stream.write(resetCursor(this.numOfLines) + linesToString(lines));
        this.numOfLines = lines.length;
    }
    append(lines) {
        this.stream.write(linesToString(lines));
        this.numOfLines += lines.length;
    }
    flush() {
        this.numOfLines = 0;
    }
}
