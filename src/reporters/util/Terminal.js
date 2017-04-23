import { EOL } from "os";
import ansiEscapes from "ansi-escapes";
import cliCursor from "cli-cursor";

function linesToString(lines) {
    return ansiEscapes.eraseDown + lines.join(EOL) + EOL;
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

export default class Terminal {
    constructor(stream) {
        setBlocking(stream);
        cliCursor.hide(stream);
        this.stream = stream;
        this.bookmarks = [];
    }
    saveCursorPosition(bookmark) {
        this.bookmarks.push(
            bookmark === undefined ? this.bookmarks.length : bookmark
        );
        this.write(ansiEscapes.cursorSavePosition);
    }
    restoreCursorPosition(bookmark) {
        const index = Math.max(
            bookmark === undefined ?
                this.bookmarks.length - 1 :
                this.bookmarks.lastIndexOf(bookmark),
            0
        );
        const cursorRestorePosition = new Array(
            Math.max(this.bookmarks.length - index, 0)
        )
            .fill(ansiEscapes.cursorRestorePosition)
            .join("");

        this.write(cursorRestorePosition);
    }
    append(lines) {
        this.write(linesToString(lines, this.stream.columns));
    }
    write(content) {
        this.stream.write(content);
    }
}
