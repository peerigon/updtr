import { EOL } from "os";
import fs from "fs";
import path from "path";
import yargs from "yargs";
import chalk from "chalk";
import reporters from "../reporters";
import {
    USE_OPTIONS,
    USE_NPM,
    USE_YARN,
    UPDATE_TO_OPTIONS,
    SAVE_OPTIONS,
} from "../constants/config";

const reporterNames = Object.keys(reporters);
const pathToYarnLock = path.join(process.cwd(), "yarn.lock");
const useDefault = fs.existsSync(pathToYarnLock) === true ? USE_YARN : USE_NPM;

export default yargs
    .usage(
    [
        "",
        chalk.bold.cyan("Update outdated npm modules with zero pain™"),
        `${ chalk.bold("Usage:") } $0 ${ chalk.dim("[options]") }`,
    ].join(EOL)
    )
    .option("use", {
        describe: "Specify the package manager to use",
        choices: USE_OPTIONS,
        default: useDefault,
        alias: "u",
    })
    .option("exclude", {
        describe: "Space separated list of module names that should not be updated",
        array: true,
        alias: "ex",
    })
    .option("update-to", {
        describe: "Specify which updates you want to install",
        choices: UPDATE_TO_OPTIONS,
        default: UPDATE_TO_OPTIONS[0],
        alias: "to",
    })
    .option("save", {
        describe: "Specify how updated versions should be saved to the package.json",
        choices: SAVE_OPTIONS,
        default: SAVE_OPTIONS[0],
        alias: "s",
    })
    .option("reporter", {
        describe: "Choose a reporter for the console output",
        choices: reporterNames,
        default: reporterNames[0],
        alias: "r",
    })
    .option("test", {
        describe: "Specify a custom test command. Surround with quotes.",
        alias: "t",
    })
    .option("test-stdout", {
        describe: "Show test stdout if the update fails",
        boolean: true,
        alias: "out",
    })
    .option("registry", {
        describe: "Specify a custom registry to use",
        alias: "reg",
    })
    .version()
    .wrap(null)
    .help().argv;
