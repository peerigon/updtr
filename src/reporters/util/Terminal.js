import ansiEscapes from "ansi-escapes";
import cliCursor from "cli-cursor";
import isCI from "is-ci";
import stringWidth from "string-width";

function calcNumOfRows(lines, columns) {
    return lines
        .map(lineContent => Math.ceil(stringWidth(lineContent) / columns))
        .reduce((allRows, rows) => allRows + rows, 0);
}

// Solves some issues where stdout output is truncated
// See https://github.com/nodejs/node/issues/6456
function setBlocking(stream) {
    if (stream._handle && typeof stream._handle.setBlocking === "function") {
        stream._handle.setBlocking(true);
    }
}

export default class Terminal {
    constructor(stream) {
        if (stream.isTTY !== true && !isCI) {
            throw new Error("Given stream is not a TTY stream");
        }
        setBlocking(stream);
        cliCursor.hide(stream);
        this.stream = stream;
        this.lines = [];
        this.hasBeenResized = false;
        this.stream.on("resize", () => {
            this.hasBeenResized = true;
        });
    }
    append(lines) {
        if (lines.length === 0) {
            return;
        }
        this.lines.push(lines);

        const content = this.hasBeenResized === true ?
            ansiEscapes.clearScreen +
                  this.lines.map(lines => lines.join("\n")).join("\n") :
            ansiEscapes.eraseDown + lines.join("\n");

        this.stream.write(content + "\n");
        this.hasBeenResized = false;
    }
    rewind() {
        const removedLines = this.lines.pop();
        const rows = calcNumOfRows(removedLines, this.stream.columns);

        this.stream.write(ansiEscapes.cursorUp(rows));
    }
}
