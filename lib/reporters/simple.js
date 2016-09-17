"use strict";

var unicons = require("unicons");

var util = require("./util");

function defaultReporter(emitter) {
    var currentLine = "";

    function logProgress(message) {
        currentLine = message;
        console.log(message + "... ".grey);
    }

    function finishProgress(message) {
        if (message) {
            console.log.apply(console, arguments);
        } else {
            console.log(currentLine);
        }
        currentLine = "";
    }

    function logUpdateProgress(event, status, message) {
        var progress = event.current + "/" + event.total;
        var circle = unicons.cli("circle");
        var name = event.info.name;

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
            message
        ].join(" "));
    }

    // Activate colors by extending String.prototype
    require("colors");

    emitter.on("init", function () {
        logProgress("Looking for outdated modules");
    });
    emitter.on("noop", function () {
        finishProgress("No outdated modules found. Are they installed?");
    });
    emitter.on("modulesMissing", function (event) {
        finishProgress(util.modulesMissingMessage(event));
    });
    emitter.on("outdated", function (event) {
        finishProgress("Found %s outdated module%s", event.total, event.total === 1 ? "" : "s");
        console.log("");
        console.log("Starting to update your modules" + "...".grey);
    });
    emitter.on("updating", function (event) {
        var info = event.info;

        logUpdateProgress(event, "pending", "updating ".grey + info.current + " " + unicons.cli("arrowRight").grey + " " + info.updateTo);
    });
    emitter.on("testing", function (event) {
        logUpdateProgress(event, "pending", "testing".grey);
    });
    emitter.on("rollback", function (event) {
        logUpdateProgress(event, "error", "rolling back".grey);
    });
    emitter.on("rollbackDone", function (event) {
        var info = event.info;

        logUpdateProgress(event, "error", info.updateTo + " failed".grey);
        console.log("");
    });
    emitter.on("testStdout", function (event) {
        console.log(event.testStdout);
    });
    emitter.on("updatingDone", function (event) {
        var info = event.info;

        logUpdateProgress(event, "success", info.updateTo + " success".grey);
        console.log("");
    });
    emitter.on("finished", function () {
        console.log("");
        console.log("Finished");
    });
}

module.exports = defaultReporter;
