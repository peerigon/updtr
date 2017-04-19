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
import customConfigToLines from "./util/customConfigToLines";
import pluralize from "./util/pluralize";

const spinner = new Spinner("dots");

function updatingLine(updateTask) {
    return [
        new Indicator(INDICATOR_PENDING),
        chalk.bold(updateTask.name),
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
        updateTask.rollbackTo,
        chalk.grey("..."),
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

function cmdToLines(description, cmd) {
    const lines = Array.isArray(description) === true ?
        description :
        [description];

    return lines.concat([chalk.grey(`> ${ cmd } `), spinner]);
}

export default function (updtr, reporterConfig) {
    const terminal = new Terminal(process.stdout);
    const projector = new Projector(terminal);
    const startTime = Date.now();
    let excludedModules;

    updtr.on("start", ({ config }) => {
        terminal.append(customConfigToLines(config));
    });
    updtr.on("init/install-missing", ({ cmd }) => {
        projector.display(cmdToLines("Installing missing dependencies", cmd));
    });
    updtr.on("init/collect", ({ cmd }) => {
        projector.display(cmdToLines("Looking for outdated modules", cmd));
    });
    updtr.on("init/end", ({ updateTasks }) => {
        projector.stop();
        terminal.unwind();
        terminal.append([
            new Message("Found %s update%s.", [
                updateTasks.length,
                pluralize(updateTasks.length),
            ]),
        ]);
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
        terminal.unwind();
        terminal.append(
            event.updateTasks.map(event.success ? successLine : failLine)
        );
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
        terminal.unwind();
        terminal.append([(event.success ? successLine : failLine)(event)]);
    });
}
