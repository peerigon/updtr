"use strict";

var symbols = {
    ok: "✓",
    err: "✖",
    arrow: "→",
    circle: "●"
};

if (process.platform === "win32") {
    symbols.ok = "\u221A";
    symbols.err = "\u00D7";
    symbols.arrow = "\u2192";
}

module.exports = symbols;
