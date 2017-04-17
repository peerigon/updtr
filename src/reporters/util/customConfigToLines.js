import configList from "./configList";
import List from "./List";

export default function customConfigToLines(config) {
    const list = configList(config);
    const lines = [];

    if (list.length > 0) {
        lines.push(
            "Running updtr with custom configuration:",
            "",
            new List(list),
            ""
        );
    }

    return lines;
}
