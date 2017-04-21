import { EOL } from "os";
import chalk from "chalk";
import { PackageJsonNoAccessError } from "../../errors";

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
            const stack = err.stack.split(EOL);

            stack.shift();
            lines.push(ERROR + " " + err.message);
            lines.push(...stack.map(line => chalk.grey(line)));
        }
    }
    lines.push("");

    console.error(lines.join(EOL));
    process.exit(1); // eslint-disable-line no-process-exit
}
