import { EOL } from "os";
import chalk from "chalk";
import unicons from "unicons";
import configList from "./util/configList";
import excludedList from "./util/excludedList";
import pluralize from "./util/pluralize";
import execEvents from "./util/execEvents";
import handleError from "./util/handleError";

const PASS = chalk.green.bold.inverse(" PASS ");
const FAIL = chalk.bold.bgRed(" FAIL ");

function stringifySuccess(success) {
    return success === true ? PASS : FAIL;
}

function printList(list, start = "- ") {
    list.forEach(str => console.log(start + str));
}

function printCmd({ cmd }) {
    console.log(chalk.grey("> " + cmd));
}

function printTestResult({ success }) {
    console.log("Test " + stringifySuccess(success));
}

function printTestStdoutOnFail({ stdout, success }) {
    if (success === false) {
        console.log(stdout);
    }
}

export default function (updtr, reporterConfig) {
    let currentSequence;

    updtr.on("start", event => {
        const list = configList(event.config);

        if (list.length > 0) {
            console.log("Running updtr with custom configuration:");
            printList(configList(event.config));
        }
        console.log("");
    });

    updtr.on("init/start", () => {
        currentSequence = "init";
        console.log("Initializing...");
    });
    updtr.on("init/end", ({ updateTasks, excluded }) => {
        const numOfOutdated = updateTasks.length + excluded.length;

        console.log(
            "Found %s outdated module%s.",
            numOfOutdated,
            pluralize(numOfOutdated)
        );
        if (excluded.length > 0) {
            console.log(
                "Excluding %s module%s: ",
                excluded.length,
                pluralize(excluded.length)
            );
            printList(excludedList(excluded));
        }
    });

    updtr.on("batch-update/start", ({ updateTasks }) => {
        currentSequence = "batch-update";
        console.log(
            "Starting batch update with %s non-breaking update%s...",
            updateTasks.length,
            pluralize(updateTasks.length)
        );
    });
    updtr.on("batch-update/test-result", printTestResult);
    if (reporterConfig.testStdout === true) {
        updtr.on("batch-update/test-result", printTestStdoutOnFail);
    }
    updtr.on("batch-update/end", ({ success }) => {
        if (success === false) {
            console.log(
                "Batch updated failed. Proceeding with sequential update..."
            );
        }
    });

    updtr.on("sequential-update/start", ({ updateTasks }) => {
        currentSequence = "sequential-update";
        console.log(
            "Starting sequential update with %s update%s...",
            updateTasks.length,
            pluralize(updateTasks.length)
        );
    });
    if (reporterConfig.testStdout === true) {
        updtr.on("sequential-update/test-result", printTestStdoutOnFail);
    }
    updtr.on("sequential-update/test-result", printTestResult);

    updtr.on("finish/start", () => {
        currentSequence = "finish";
    });

    execEvents.forEach(eventName => updtr.on(eventName, printCmd));

    updtr.on("end", ({ results }) => {
        const stringifiedResults = results
            .map(result =>
                [
                    stringifySuccess(result.success),
                    result.name,
                    chalk.grey(result.rollbackTo),
                    chalk.grey(unicons.arrowRight),
                    chalk.grey(result.updateTo),
                ].join(" "))
            .join(EOL);

        if (stringifiedResults === "") {
            console.log("");
            console.log("Nothing to do.");
        } else {
            console.log("Finished.");
            console.log("");
            console.log(stringifiedResults);
        }
    });

    updtr.on("error", err => void handleError(err, currentSequence));
}
