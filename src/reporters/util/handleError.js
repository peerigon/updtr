import chalk from "chalk";
import {PackageJsonNoAccessError} from "../../errors";

const ERROR = chalk.bgRed.bold(" ERROR ");

export default function handleError(err) {
    const lines = [""];

    switch (err.constructor) {
        case PackageJsonNoAccessError:
            lines.push(
                ERROR + " Cannot find package.json in current directory."
            );
            break;
        default: {
            // The stack does only contain \n, also on windows
            const stack = err.stack.split("\n");

            stack.shift();
            lines.push(ERROR + " " + err.message);
            lines.push(...stack.map(line => chalk.grey(line)));
        }
    }
    lines.push("");

    console.error(lines.join("\n"));
    process.exit(1); // eslint-disable-line no-process-exit
}
