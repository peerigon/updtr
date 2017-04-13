import chalk from "chalk";
import unicons from "unicons";
import configList from "./util/configList";
import excludedList from "./util/excludedList";
import pluralize from "./util/pluralize";
import execEvents from "./util/execEvents";

const OK = chalk.green.bold.inverse("   OK   ");
const FAILED = chalk.bold.bgRed(" FAILED ");

function stringifySuccess(success) {
    return success === true ? OK : FAILED;
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

function printTestStdout({ stdout }) {
    console.log(stdout);
}

export default function (updtr, reporterConfig) {
    updtr.on("start", event => {
        const list = configList(event.config);

        if (list.length > 0) {
            console.log("Running updtr with custom configuration:");
            printList(configList(event.config));
        }
    });
    updtr.on("init/start", () => {
        console.log("Initializing...");
    });
    updtr.on("init/end", ({ updateTasks, excluded }) => {
        const numOfOutdated = updateTasks.length + excluded.length;

        console.log(
            "Found %s outdated module%s",
            numOfOutdated,
            pluralize(numOfOutdated)
        );
        if (excluded.length > 0) {
            console.log(
                "Excluding %s module%s: ",
                excluded.length,
                pluralize(excluded)
            );
            printList(excludedList(excluded));
        }
    });
    updtr.on("batch-update/start", ({ updateTasks }) => {
        console.log(
            "Starting batch update with %s non-breaking update%s...",
            updateTasks.length,
            pluralize(updateTasks)
        );
    });
    updtr.on("batch-update/test-result", printTestResult);
    if (reporterConfig.testStdout === true) {
        updtr.on("batch-update/test-result", printTestStdout);
    }
    updtr.on("batch-update/end", ({ success }) => {
        if (success === false) {
            console.log(
                "Batch updated failed. Proceeding with sequential update..."
            );
        }
    });
    updtr.on("sequential-update/start", ({ updateTasks }) => {
        console.log(
            "Starting sequential update with %s update%s...",
            updateTasks.length,
            pluralize(updateTasks)
        );
    });
    updtr.on("sequential-update/test-result", printTestResult);
    if (reporterConfig.testStdout === true) {
        updtr.on("sequential-update/test-result", printTestStdout);
    }

    execEvents.forEach(eventName => updtr.on(eventName, printCmd));

    updtr.on("end", ({ results }) => {
        console.log("");
        console.log("Update results:");
        printList(
            results.map(result =>
                [
                    stringifySuccess(result.success),
                    result.name,
                    chalk.grey(result.rollbackTo),
                    chalk.grey(unicons.arrowRight),
                    chalk.grey(result.updateTo),
                ].join(" "))
        );
    });
}
