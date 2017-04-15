import chalk from "chalk";

export function neutral(text) {
    return chalk.bold.grey(" " + text.toUpperCase() + " ");
}

export function note(text) {
    return chalk.bold.yellow(" " + text.toUpperCase() + " ");
}

export function ok(text) {
    return chalk.bold.bgGreen(" " + text.toUpperCase() + " ");
}

export function error(text) {
    return chalk.bold.bgRed(" " + text.toUpperCase() + " ");
}
