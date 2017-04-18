import { EOL } from "os";
import { cursor, erase } from "ansi-escape-sequences";
import truncate from "cli-truncate";
import cliCursor from "cli-cursor";
import stringWidth from "string-width";

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

function resetCursor(previousContent, columns) {
    const totalWidth = stringWidth(previousContent);
    const y = previousContent
        .split(EOL)
        .map(lineContent => Math.ceil(stringWidth(lineContent) / columns))
        .reduce((y, lines) => y + lines, 0);

    return y === 0 ? "" : cursor.previousLine(y);
}

function calcNumOfRows(lines, columns) {
    return lines
        .map(lineContent => Math.ceil(stringWidth(lineContent) / columns))
        .reduce((y, lines) => y + lines, 0);
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
        cliCursor.hide(stream);
        this.stream = stream;
        this.flush();
        // stream.on("resize", () => this.replace(this.lines));
    }
    replace(lines) {
        const content = linesToString(lines);
        const resetCursor = this.numOfRows === 0 ?
            "" :
            cursor.previousLine(this.numOfRows);

        this.stream.write(resetCursor + content);
        this.numOfRows = calcNumOfRows(lines, this.stream.columns);
        // console.log(this.stream.columns);
        // console.log(this.numOfRows);
        // console.log("--------------------------------------------");
    }
    append(lines) {
        const content = linesToString(lines, this.stream.columns);

        this.stream.write(content);
        this.numOfRows += calcNumOfRows(lines, this.stream.columns) + 1;
    }
    flush() {
        this.numOfRows = 0;
    }
}