import { EOL } from "os";
import { cursor, erase } from "ansi-escape-sequences";
import cliCursor from "cli-cursor";
import stringWidth from "string-width";

const newLine = erase.inLine() + EOL;
const FROM_CURSOR_TO_END = 0;

function linesToString(lines) {
    return lines.reduceRight(
        (str, line) => line + newLine + str,
        erase.display(FROM_CURSOR_TO_END)
    );
}

function calcNumOfRows(lines, columns) {
    return lines
        .map(lineContent => Math.ceil(stringWidth(lineContent) / columns))
        .reduce((y, lines) => y + lines, 0);
}

// Solves some issues where stdout output is truncated
// See https://github.com/nodejs/node/issues/6456
function setBlocking(stream) {
    if (
        stream._handle &&
        stream.isTTY &&
        typeof stream._handle.setBlocking === "function"
    ) {
        stream._handle.setBlocking(true);
    }
}

function sum(sum, num) {
    return sum + num;
}

export default class Terminal {
    constructor(stream) {
        setBlocking(stream);
        cliCursor.hide(stream);
        this.stream = stream;
        this.rowsPerAppend = [];
    }
    append(lines) {
        this.write(linesToString(lines, this.stream.columns));
        this.rowsPerAppend.push(calcNumOfRows(lines, this.stream.columns));
    }
    rewind(position = -1) {
        const sumOfRows = this.rowsPerAppend
            .slice(position, Infinity)
            .reduce(sum, 0);
        const resetCursor = sumOfRows > 0 ? cursor.previousLine(sumOfRows) : "";

        this.rowsPerAppend = this.rowsPerAppend.slice(0, position);
        this.write(resetCursor);
    }
    write(content) {
        this.stream.write(content);
    }
}
