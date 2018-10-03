import ansiEscapes from "ansi-escapes";
import chalk from "chalk";
import unicons from "unicons";
import {
    filterSuccessfulUpdates,
    filterFailedUpdates,
} from "../tasks/util/filterUpdateResults";
import Message from "./util/Message";
import Indicator, {
    INDICATOR_NEUTRAL,
    INDICATOR_PENDING,
    INDICATOR_OK,
    INDICATOR_FAIL,
} from "./util/Indicator";
import customConfigToLines from "./util/customConfigToLines";
import pluralize from "./util/pluralize";
import handleError from "./util/handleError";
import msToString from "./util/msToString";

function updatingLine(updateTask) {
    return [
        new Indicator(INDICATOR_PENDING),
        chalk.bold(updateTask.name),
        chalk.grey("updating"),
        updateTask.rollbackTo,
        chalk.grey(unicons.arrowRight),
        updateTask.updateTo + chalk.grey("..."),
    ].join(" ");
}

function testingLine(updateTask) {
    return [
        new Indicator(INDICATOR_PENDING),
        chalk.bold(updateTask.name),
        chalk.grey("testing..."),
    ].join(" ");
}

function rollbackLine(updateTask) {
    return [
        new Indicator(INDICATOR_FAIL),
        chalk.bold.red(updateTask.name),
        chalk.grey("rolling back"),
        updateTask.updateTo,
        chalk.grey(unicons.arrowRight),
        updateTask.rollbackTo + chalk.grey("..."),
    ].join(" ");
}

function successLine(updateTask) {
    return [
        new Indicator(INDICATOR_OK),
        chalk.bold(updateTask.name),
        updateTask.updateTo,
        chalk.grey("success"),
    ].join(" ");
}

function failLine(updateTask) {
    return [
        new Indicator(INDICATOR_FAIL),
        chalk.bold.red(updateTask.name),
        updateTask.updateTo,
        chalk.grey("failed"),
    ].join(" ");
}

function excludedLine(excluded) {
    return [
        new Indicator(INDICATOR_NEUTRAL),
        chalk.bold(excluded.name),
        chalk.grey(excluded.reason),
    ].join(" ");
}

function cmdToLines(description, cmd) {
    const lines = Array.isArray(description) === true ?
        description :
        [description];

    return lines.concat([chalk.grey(`> ${cmd} `)]);
}

function writeLinesToConsole(lines) {
    if (lines.length === 0) {
        return;
    }
    console.log(ansiEscapes.eraseDown + lines.join("\n"));
}

export default function basic(updtr, reporterConfig) {
    const startTime = Date.now();
    let excludedModules;

    updtr.on("start", ({config}) => {
        writeLinesToConsole(customConfigToLines(config));
    });
    updtr.on("init/install-missing", ({cmd}) => {
        writeLinesToConsole(
            cmdToLines(
                "Installing missing dependencies" + chalk.grey("..."),
                cmd
            )
        );
    });
    updtr.on("init/collect", ({cmd}) => {
        writeLinesToConsole(
            cmdToLines("Looking for outdated modules" + chalk.grey("..."), cmd)
        );
    });
    updtr.on("init/end", ({updateTasks, excluded}) => {
        excludedModules = excluded;
        if (updateTasks.length === 0 && excluded.length === 0) {
            writeLinesToConsole(["Everything " + chalk.bold("up-to-date")]);
        } else if (updateTasks.length === 0) {
            writeLinesToConsole([
                chalk.bold("No updates available") +
                " for the given modules and version range",
            ]);
        } else {
            writeLinesToConsole([
                new Message("Found " + chalk.bold("%s update%s") + ".", [
                    updateTasks.length,
                    pluralize(updateTasks.length),
                ]),
                "",
            ]);
        }
    });
    updtr.on("batch-update/updating", event => {
        writeLinesToConsole(
            cmdToLines(event.updateTasks.map(updatingLine), event.cmd)
        );
    });
    updtr.on("batch-update/testing", event => {
        writeLinesToConsole(
            cmdToLines(event.updateTasks.map(testingLine), event.cmd)
        );
    });
    updtr.on("batch-update/rollback", event => {
        writeLinesToConsole(
            cmdToLines(event.updateTasks.map(rollbackLine), event.cmd)
        );
    });
    updtr.on("batch-update/result", event => {
        if (event.success === true) {
            writeLinesToConsole(
                event.updateTasks.map(event.success ? successLine : failLine)
            );
        }
        // Not showing the test stdout here when there was an error because
        // we will proceed with the sequential update.
    });
    updtr.on("sequential-update/updating", event => {
        writeLinesToConsole(cmdToLines(updatingLine(event), event.cmd));
    });
    updtr.on("sequential-update/testing", event => {
        writeLinesToConsole(cmdToLines(testingLine(event), event.cmd));
    });
    updtr.on("sequential-update/rollback", event => {
        writeLinesToConsole(cmdToLines(rollbackLine(event), event.cmd));
    });
    updtr.on("sequential-update/result", event => {
        writeLinesToConsole([(event.success ? successLine : failLine)(event)]);
        if (reporterConfig.testStdout === true && event.success === false) {
            writeLinesToConsole([event.stdout]);
        }
    });
    updtr.on("end", ({results}) => {
        const duration = msToString(Date.now() - startTime);
        const successful = filterSuccessfulUpdates(results);
        const failed = filterFailedUpdates(results);

        writeLinesToConsole([""]);

        if (successful.length > 0) {
            writeLinesToConsole([
                new Message(chalk.bold("%s successful") + " update%s.", [
                    successful.length,
                    pluralize(successful.length),
                ]),
            ]);
        }
        if (failed.length > 0) {
            writeLinesToConsole([
                new Message(chalk.bold("%s failed") + " update%s.", [
                    failed.length,
                    pluralize(failed.length),
                ]),
            ]);
        }
        if (excludedModules.length > 0) {
            const list = excludedModules.map(excludedLine);

            if (successful.length > 0 || failed.length > 0) {
                writeLinesToConsole([""]);
            }
            writeLinesToConsole(
                [
                    new Message(chalk.bold("%s skipped") + " module%s:", [
                        excludedModules.length,
                        pluralize(excludedModules.length),
                    ]),
                    "",
                ].concat(list)
            );
        }

        writeLinesToConsole(["", new Message("Finished after %s.", [duration])]);
    });
    updtr.on("error", err => void handleError(err));
}
