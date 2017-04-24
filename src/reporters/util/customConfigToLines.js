import unicons from "unicons";
import configList from "./configList";

export default function customConfigToLines(config) {
    const list = configList(config);
    const lines = [];

    if (list.length > 0) {
        lines.push(
            "Running updtr with custom configuration:",
            "",
            ...list.map(item => unicons.cli("circle") + " " + item),
            ""
        );
    }

    return lines;
}
