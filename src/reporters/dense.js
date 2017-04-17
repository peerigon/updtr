import chalk from "chalk";
import unicons from "unicons";
import Projector from "./util/Projector";
import Terminal from "./util/Terminal";
import Message from "./util/Message";
import Spinner from "./util/Spinner";
import Indicator, {
    INDICATOR_PENDING,
    INDICATOR_OK,
    INDICATOR_FAIL,
} from "./util/Indicator";
import configList from "./util/configList";
import customConfigToLines from "./util/customConfigToLines";
import pluralize from "./util/pluralize";
import {
    STATE_UPDATING,
    STATE_TESTING,
    STATE_ROLLBACK,
} from "../tasks/util/updateStates";

const spinner = new Spinner("dots");

function updatingLine(updateTask) {
    return [
        new Indicator(INDICATOR_PENDING),
        updateTask.name,
        chalk.grey("updating"),
        updateTask.rollbackTo,
        chalk.grey(unicons.arrowRight),
        updateTask.updateTo,
        chalk.grey("..."),
    ].join(" ");
}

function testingLine(updateTask) {
    return [
        new Indicator(INDICATOR_PENDING),
        updateTask.name,
        chalk.grey("testing..."),
    ].join(" ");
}

function rollbackLine(updateTask) {
    return [
        new Indicator(INDICATOR_FAIL),
        chalk.red(updateTask.name),
        chalk.grey("rolling back"),
        updateTask.updateTo,
        chalk.grey(unicons.arrowRight),
        updateTask.rollbackTo,
        chalk.grey("..."),
    ].join(" ");
}

function successLine(updateTask) {
    return [
        new Indicator(INDICATOR_OK),
        chalk.green(updateTask.name),
        chalk.grey("success"),
    ].join(" ");
}

function failLine(updateTask) {
    return [
        new Indicator(INDICATOR_FAIL),
        chalk.red(updateTask.name),
        chalk.grey("failed"),
    ].join(" ");
}

function cmdToLines(description, cmd) {
    return [description, [chalk.grey(cmd + " "), spinner]];
}

export default function (updtr, reporterConfig) {
    const terminal = new Terminal(process.stdout);
    const projector = new Projector(terminal);
    const startTime = Date.now();
    let excludedModules;

    updtr.on("start", ({ config }) => {
        terminal.append(customConfigToLines(config));
        terminal.flush();
    });
    updtr.on("init/install-missing", ({ cmd }) => {
        projector.start();
        projector.frame = cmdToLines(["Installing missing dependencies"], cmd);
    });
    updtr.on("init/collect", ({ cmd }) => {
        projector.frame = cmdToLines(["Looking for outdated modules"], cmd);
    });
    updtr.on("init/end", ({ updateTasks }) => {
        projector.stop();
        terminal.replace([
            new Message("Found %s update%s.", [
                updateTasks.length,
                pluralize(updateTasks.length),
            ]),
        ]);
        terminal.flush();
    });
    updtr.on("batch-update/start", ({ updateTasks }) => {
        terminal.append([
            new Message(
                "Starting batch update with %s non-breaking update%s...",
                [updateTasks.length, pluralize(updateTasks.length)]
            ),
        ]);
        terminal.flush();
    });
    updtr.on("sequential-update/start", ({ updateTasks }) => {
        terminal.append([
            new Message("Starting sequential update with %s update%s...", [
                updateTasks.length,
                pluralize(updateTasks.length),
            ]),
        ]);
        terminal.flush();
    });
    updtr.on("sequential-update/updating", event => {
        projector.start();
        projector.frame = cmdToLines(updatingLine(event), event.cmd);
    });
    updtr.on("sequential-update/testing", event => {
        projector.frame = cmdToLines(testingLine(event), event.cmd);
    });
    updtr.on("sequential-update/rollback", event => {
        projector.frame = cmdToLines(rollbackLine(event), event.cmd);
    });
    updtr.on("sequential-update/result", event => {
        projector.stop();
        terminal.replace([(event.success ? successLine : failLine)(event)]);
        terminal.flush();
    });
}
