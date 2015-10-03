"use strict";

var colors = require("colors");
var Spinner = require("cli-spinner").Spinner;

var symbols = {
    ok: "✓",
    err: "✖",
    arrow: "→"
};

if (process.platform === "win32") {
    symbols.ok = "\u221A";
    symbols.err = "\u00D7";
    symbols.arrow = "\u2192";
}

function defaultReporter(emitter) {
    var spinner;

    function log(message) {
        if (spinner) {
            spinner.stop();
        }
        spinner = new Spinner(message + "%s ");
        spinner.setSpinnerString(10);
        spinner.start();
    }

    function clear() {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
    }

    emitter.on("init", function () {
        log("Looking for outdated modules" + "...".grey);
    });
    emitter.on("noop", function () {
        spinner.stop(true);
        console.log("No outdated modules found");
    });
    emitter.on("outdated", function (event) {
        spinner.stop(true);
        console.log("Found %s outdated module%s", event.total, event.total === 1 ? "" : "s");
        console.log("");
        console.log("Starting to update your modules" + "...".grey);
    });
    emitter.on("updating", function (event) {
        var info = event.info;

        log(colors.grey("(" + event.current + "/" + event.total + ")") + "\t" + info.name + "\tupdating ".grey + info.current + " " + symbols.arrow.gray + " " + info.latest);
    });
    emitter.on("testing", function (event) {
        var info = event.info;

        log(colors.grey("(" + event.current + "/" + event.total + ")") + "\t" + info.name + "\tupdating ".grey + info.current + " " + symbols.arrow.gray + " " + info.latest + "\ttests: ");
    });
    emitter.on("rollback", function (event) {
        var info = event.info;

        log(
            colors.grey("(" + event.current + "/" + event.total + ")") + "\t" + info.name.red + "\tupdating ".grey + info.current + " " + symbols.arrow.gray + " " + info.latest +
            "\ttests: " + symbols.err.red + "\trolling back to " + info.current
        );
    });
    emitter.on("rollbackDone", function (event) {
        var info = event.info;

        spinner.stop();
        clear();
        process.stdout.write(
            colors.grey("(" + event.current + "/" + event.total + ")") + "\t" + info.name.red + "\tupdating ".grey + info.current + " " + symbols.arrow.gray + " " + info.latest +
            "\ttests: " + symbols.err.red + "\trolling back to " + info.current + " " + symbols.ok.grey + "\n"
        );
    });
    emitter.on("updatingDone", function (event) {
        var info = event.info;

        spinner.stop();
        clear();
        process.stdout.write(
            colors.grey("(" + event.current + "/" + event.total + ")") + "\t" + info.name + "\tupdating ".grey + info.current + " " + symbols.arrow.gray + " " + info.latest + "\ttests: " + symbols.ok.green + "\n"
        );
    });
    emitter.on("finished", function () {
        console.log("");
        console.log("Finished.");
        spinner.stop();
    });
}

module.exports = defaultReporter;
