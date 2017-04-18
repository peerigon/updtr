import { EOL } from "os";
import { cursor, erase } from "ansi-escape-sequences";
import truncate from "cli-truncate";

const newLine = erase.inLine() + EOL;

function linesToString(lines) {
    if (lines.length > 0) {
        return lines.join(newLine) + newLine + erase.display();
    }

    return "";
}

function truncateLines(lines, width) {
    return lines.map(line => truncate(String(line), width));
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
        stream.on("resize", () => this.replace(this.lines));
    }
    replace(lines) {
        const previousLines = this.lines;
        const content = linesToString(
            truncateLines(lines, this.stream.columns)
        );

        this.lines = lines;
        this.stream.write(resetCursor(previousLines.length) + content);
    }
    append(lines) {
        this.lines = this.lines.concat(lines);
        this.stream.write(linesToString(lines));
    }
    flush() {
        this.lines = [];
    }
}
