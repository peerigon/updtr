import chalk from "chalk";
import Spinner from "./Spinner";

const dots = new Spinner("dots");

export default function cmdToLines(description, cmd) {
    return [[...description, chalk.grey("...")], [chalk.grey(cmd + " "), dots]];
}
