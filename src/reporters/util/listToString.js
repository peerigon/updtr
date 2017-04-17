import { EOL } from "os";

export default function listToString(list, listItem = "- ") {
    return list.map(item => listItem + item).join(EOL);
}
