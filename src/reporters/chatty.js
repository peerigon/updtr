import { Spinner } from "cli-spinner";
import unicons from "unicons";
import chalk from "chalk";

export default function chatty(updtr) {
    let currentLine = "";
    let spinner;

    function logProgress(message) {
        if (spinner) {
            spinner.stop();
        }
        currentLine = message;
        spinner = new Spinner(message + chalk.grey.dim("... %s"));
        spinner.setSpinnerString(19);
        spinner.start();
    }

    function finishProgress(message, ...args) {
        if (spinner) {
            spinner.stop(true);
        }
        if (message) {
            console.log(message, ...args);
        } else {
            console.log(currentLine);
        }
        currentLine = "";
    }

    function logUpdateProgress(event, status, message) {
        const progress = event.current + "/" + event.total;
        let circle = unicons.cli("circle");
        let name = event.info.name;

        if (status === "error") {
            circle = circle.red;
            name = name.red;
        } else if (status === "success") {
            circle = circle.green;
        } else {
            circle = circle.grey;
        }

        logProgress([progress.grey, "\t", circle, name, message].join(" "));
    }

    updtr.on("init/start", event => {
        logProgress("Looking for outdated modules");
    });
    updtr.on("end", event => {
        console.log(chalk.bold.green("Finished"));
    });
}
