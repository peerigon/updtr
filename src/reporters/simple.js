import { EOL } from "os";
import configList from "./util/configList";
import excludedList from "./util/excludedList";
import pluralize from "./util/pluralize";
import execEvents from "./util/execEvents";

function printList(list) {
    console.log("");
    console.log(list.map(str => "- " + str).join(EOL));
}

function printCmd({ cmd }) {
    console.log(cmd);
}

export default function (updtr) {
    updtr.on("start", event => {
        console.log("Running updtr with configuration:");
        printList(configList(event.config));
    });
    updtr.on("init/start", () => {
        console.log("");
        console.log("Initializing...");
        console.log("");
    });
    updtr.on("init/end", ({ updateTasks, excluded }) => {
        console.log("");
        console.log(
            "Found %s outdated module%s.",
            updateTasks.length,
            pluralize(updateTasks)
        );
        if (excluded.length > 0) {
            console.log(
                "Excluding %s module%s: ",
                excluded.length,
                pluralize(excluded)
            );
            printList(excludedList(excluded));
        }
    });
    updtr.on("batch-update/start", ({ updateTasks }) => {
        console.log("");
        console.log(
            "Found %s non-breaking update%s. Running batch update...",
            updateTasks.length,
            pluralize(updateTasks)
        );
        console.log("");
    });
    updtr.on("end", event => {
        console.log("");
        console.log("Done.");
    });
    execEvents.forEach(eventName => updtr.on(eventName, printCmd));
}
