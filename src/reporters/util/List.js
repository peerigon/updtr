import { EOL } from "os";
import unicons from "unicons";

export default class List {
    constructor(items, prefix = unicons.circle + " ") {
        this.items = items;
        this.prefix = prefix;
    }
    valueOf() {
        return this.items.map(item => this.prefix + item).join(EOL);
    }
    toString() {
        return this.valueOf();
    }
}
