import { EOL } from "os";
import yargs from "yargs";
import chalk from "chalk";
import reporters from "../reporters";
import packageJson from "../../package";
import { SUPPORTED_PACKAGE_MANAGERS } from "../constants/config";

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
    .option("non-breaking", {
        describe: "Only install updates within the version range",
        boolean: true,
    })
    .option("test-stdout", {
        describe: "Show test stdout if the update fails",
        boolean: true,
    })
    .option("save-exact", {
        describe: "Save exact version number",
        boolean: true,
    })
    .updateStrings({
        "Options:": chalk.bold(" Options:") + EOL,
    })
    .version()
    .wrap(null)
    .help().argv;
