import chalk from "chalk";

// common labels
export const PASS = ok("pass");
export const FAIL = error("fail");
export const SKIP = neutral("skip");
export const ERROR = error("error");

export function neutral(text) {
    return chalk.bold.grey(" " + text.toUpperCase() + " ");
}

export function note(text) {
    return chalk.bold.yellow(" " + text.toUpperCase() + " ");
}

export function ok(text) {
    return chalk.green.bold.inverse(" " + text.toUpperCase() + " ");
}

export function error(text) {
    return chalk.bold.bgRed(" " + text.toUpperCase() + " ");
}
