import { EOL } from "os";
import yargs from "yargs";
import chalk from "chalk";
import reporters from "../reporters";
import packageJson from "../../package";
import {
    SUPPORTED_PACKAGE_MANAGERS,
    UPDATE_TO_OPTIONS,
    SAVE_OPTIONS,
} from "../constants/config";

const reporterNames = Object.keys(reporters);

export default yargs
    .usage(
    [
        "",
        chalk.bold.cyan(packageJson.description),
        "",
        `${ chalk.bold(" Usage:") } $0 ${ chalk.dim("[options]") }`,
    ].join(EOL)
    )
    .option("reporter", {
        describe: "Choose a reporter for the console output",
        choices: reporterNames,
        default: reporterNames[0],
        alias: "r",
    })
    .option("use", {
        describe: "Specify the package manager to use",
        choices: SUPPORTED_PACKAGE_MANAGERS,
        default: SUPPORTED_PACKAGE_MANAGERS[0],
        alias: "u",
    })
    .option("exclude", {
        describe: "Space separated list of module names that should not be updated",
        array: true,
        alias: "e",
    })
    .option("test", {
        describe: "Specify a custom test command",
        alias: "t",
    })
    .option("registry", {
        describe: "Specify a custom registry to use",
    })
    .option("update-to", {
        describe: "Specify which updates you want to install",
        choices: UPDATE_TO_OPTIONS,
        default: UPDATE_TO_OPTIONS[0],
        alias: "to",
    })
    .option("test-stdout", {
        describe: "Show test stdout if the update fails",
        boolean: true,
    })
    .option("save", {
        describe: "Specify how updated versions should be saved to the package.json",
        choices: SAVE_OPTIONS,
        default: SAVE_OPTIONS[0],
        alias: "s",
    })
    .updateStrings({
        "Options:": chalk.bold(" Options:") + EOL,
    })
    .version()
    .wrap(null)
    .help().argv;
