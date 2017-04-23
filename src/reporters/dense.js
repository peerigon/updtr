import chalk from "chalk";
import unicons from "unicons";
import Projector from "./util/Projector";
import Terminal from "./util/Terminal";
import Message from "./util/Message";
import Spinner from "./util/Spinner";
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
import {
    filterSuccessfulUpdates,
    filterFailedUpdates,
} from "../tasks/util/filterUpdateResults";

const spinner = new Spinner("dots");

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

    return lines.concat([chalk.grey(`> ${ cmd } `), spinner]);
}

export default function (updtr, reporterConfig) {
    const terminal = new Terminal(reporterConfig.stream);
    const projector = new Projector(terminal);
    const startTime = Date.now();
    let excludedModules;

    updtr.on("start", ({ config }) => {
        terminal.append(customConfigToLines(config));
    });
    updtr.on("init/install-missing", ({ cmd }) => {
        projector.display(
            cmdToLines(
                "Installing missing dependencies" + chalk.grey("..."),
                cmd
            )
        );
    });
    updtr.on("init/collect", ({ cmd }) => {
        projector.display(
            cmdToLines("Looking for outdated modules" + chalk.grey("..."), cmd)
        );
    });
    updtr.on("init/end", ({ updateTasks, excluded }) => {
        excludedModules = excluded;
        projector.stop();
        if (updateTasks.length === 0 && excluded.length === 0) {
            terminal.append(["Everything " + chalk.bold("up-to-date")]);
        } else if (updateTasks.length === 0) {
            terminal.append([
                chalk.bold("No updates available") +
                    " for the given modules and version range",
            ]);
        } else {
            terminal.append([
                new Message("Found " + chalk.bold("%s update%s") + ".", [
                    updateTasks.length,
                    pluralize(updateTasks.length),
                ]),
                "",
            ]);
        }
    });
    updtr.on("batch-update/updating", event => {
        projector.display(
            cmdToLines(event.updateTasks.map(updatingLine), event.cmd)
        );
    });
    updtr.on("batch-update/testing", event => {
        projector.display(
            cmdToLines(event.updateTasks.map(testingLine), event.cmd)
        );
    });
    updtr.on("batch-update/rollback", event => {
        projector.display(
            cmdToLines(event.updateTasks.map(rollbackLine), event.cmd)
        );
    });
    updtr.on("batch-update/result", event => {
        projector.stop();
        terminal.append(
            event.updateTasks.map(event.success ? successLine : failLine)
        );
        if (reporterConfig.testStdout === true && event.success === false) {
            terminal.append([event.stdout]);
        }
    });
    updtr.on("sequential-update/updating", event => {
        projector.display(cmdToLines(updatingLine(event), event.cmd));
    });
    updtr.on("sequential-update/testing", event => {
        projector.display(cmdToLines(testingLine(event), event.cmd));
    });
    updtr.on("sequential-update/rollback", event => {
        projector.display(cmdToLines(rollbackLine(event), event.cmd));
    });
    updtr.on("sequential-update/result", event => {
        projector.stop();
        terminal.append([(event.success ? successLine : failLine)(event)]);
        if (reporterConfig.testStdout === true && event.success === false) {
            terminal.append([event.stdout]);
        }
    });
    updtr.on("end", ({ results }) => {
        const duration = msToString(Date.now() - startTime);
        const successful = filterSuccessfulUpdates(results);
        const failed = filterFailedUpdates(results);

        terminal.append([""]);

        if (successful.length > 0) {
            terminal.append([
                new Message(chalk.bold("%s successful") + " update%s.", [
                    successful.length,
                    pluralize(successful.length),
                ]),
            ]);
        }
        if (failed.length > 0) {
            terminal.append([
                new Message(chalk.bold("%s failed") + " update%s.", [
                    failed.length,
                    pluralize(failed.length),
                ]),
            ]);
        }
        if (excludedModules.length > 0) {
            const list = excludedModules.map(excludedLine);

            if (successful.length > 0 || failed.length > 0) {
                terminal.append([""]);
            }
            terminal.append(
                [
                    new Message(chalk.bold("%s skipped") + " module%s:", [
                        excludedModules.length,
                        pluralize(excludedModules.length),
                    ]),
                    "",
                ].concat(list)
            );
        }

        terminal.append(["", new Message("Finished after %s.", [duration])]);
    });
    updtr.on("error", err => void handleError(err));
}
