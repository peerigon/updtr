"use strict";

const Spinner = require("cli-spinner").Spinner;
const unicons = require("unicons");

const util = require("./util");

function defaultReporter(emitter) {
    let currentLine = "";
    let spinner;

    function logProgress(message) {
        if (spinner) {
            spinner.stop();
        }
        currentLine = message;
        spinner = new Spinner(message + "... ".grey + "%s ");
        spinner.setSpinnerString(19);
        spinner.start();
    }

    function finishProgress(message, ...args) {
        if (spinner) {
            spinner.stop(true);
        }
        if (message) {
            console.log(message, ...args);
        } else {
            console.log(currentLine);
        }
        currentLine = "";
    }

    function logUpdateProgress(event, status, message) {
        const progress = event.current + "/" + event.total;
        let circle = unicons.cli("circle");
        let name = event.info.name;

        if (status === "error") {
            circle = circle.red;
            name = name.red;
        } else if (status === "success") {
            circle = circle.green;
        } else {
            circle = circle.grey;
        }

        logProgress([
            progress.grey,
            "\t",
            circle,
            name,
            message,
        ].join(" "));
    }

    // Activate colors by extending String.prototype
    require("colors"); // eslint-disable-line import/no-unassigned-import

    emitter.on("init", () => {
        logProgress("Looking for outdated modules");
    });
    emitter.on("noop", () => {
        finishProgress("No outdated modules found. Are they installed?");
    });
    emitter.on("modulesMissing", (event) => {
        finishProgress(util.modulesMissingMessage(event));
    });
    emitter.on("outdated", (event) => {
        finishProgress("Found %s outdated module%s", event.total, event.total === 1 ? "" : "s");
        console.log("");
        console.log("Starting to update your modules" + "...".grey);
    });
    emitter.on("updating", (event) => {
        const info = event.info;

        logUpdateProgress(event, "pending", "updating ".grey + info.current + " " + unicons.cli("arrowRight").grey + " " + info.updateTo);
    });
    emitter.on("testing", (event) => {
        logUpdateProgress(event, "pending", "testing".grey);
    });
    emitter.on("rollback", (event) => {
        logUpdateProgress(event, "error", "rolling back".grey);
    });
    emitter.on("rollbackDone", (event) => {
        const info = event.info;

        logUpdateProgress(event, "error", info.updateTo + " failed".grey);
        finishProgress();
    });
    emitter.on("testStdout", (event) => {
        console.log(event.testStdout);
    });
    emitter.on("updatingDone", (event) => {
        const info = event.info;

        logUpdateProgress(event, "success", info.updateTo + " success".grey);
        finishProgress();
    });
    emitter.on("finished", () => {
        console.log("");
        console.log("Finished");
    });
}

module.exports = defaultReporter;
