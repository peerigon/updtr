import { EOL } from "os";
import chalk from "chalk";
import unicons from "unicons";
import configList from "./util/configList";
import pluralize from "./util/pluralize";
import execEvents from "./util/execEvents";
import handleError from "./util/handleError";
import msToString from "./util/msToString";
import { PASS, FAIL, SKIP } from "./util/labels";
import {
    filterSuccessfulUpdates,
    filterFailedUpdates,
} from "../tasks/util/filterUpdateResults";

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
    const startTime = Date.now();
    let currentSequence;
    let excludedModules;

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

        excludedModules = excluded;
        console.log(
            "Found %s outdated module%s.",
            numOfOutdated,
            pluralize(numOfOutdated)
        );
        if (excluded.length > 0) {
            console.log(
                "Excluding %s module%s.",
                excluded.length,
                pluralize(excluded.length)
            );
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
        const duration = msToString(Date.now() - startTime);

        if (results.length === 0) {
            console.log("");
            console.log(
                "No updates within given version range available. Finished after %s.",
                duration
            );
        } else {
            const successful = filterSuccessfulUpdates(results);
            const failed = filterFailedUpdates(results);
            const stringifiedResults = successful
                .concat(failed)
                .map(result =>
                    [
                        stringifySuccess(result.success),
                        result.name,
                        chalk.grey(result.rollbackTo),
                        chalk.grey(unicons.arrowRight),
                        chalk.grey(result.updateTo),
                    ].join(" ")
                )
                .concat(
                excludedModules.map(excluded =>
                        [SKIP, excluded.name, chalk.grey(excluded.reason)].join(
                            " "
                        )
                    )
                )
                .join(EOL);

            console.log(
                "Updated %s module%s successfully.",
                successful.length,
                pluralize(successful.length)
            );
            console.log(
                "%s update%s failed.",
                failed.length,
                pluralize(failed.length)
            );
            console.log("Finished after %s.", duration);
            console.log("");
            console.log(stringifiedResults);
        }
    });

    updtr.on("error", err => void handleError(err, currentSequence));
}
