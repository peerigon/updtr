import { EOL } from "os";
import chalk from "chalk";
import { PackageJsonNoAccessError } from "../../errors";
import { error } from "./labels";

export default function handleError(err) {
    console.log("");
    switch (err.constructor) {
        case PackageJsonNoAccessError:
            console.error(
                error("error") +
                    " Cannot find package.json in current directory."
            );
            break;
        default: {
            const stack = err.stack.split(EOL);

            stack.shift();
            console.error(error("error") + " " + err.message);
            console.error(chalk.grey(stack.join(EOL)));
        }
    }
    console.log("");
    process.exit(1); // eslint-disable-line no-process-exit
}
