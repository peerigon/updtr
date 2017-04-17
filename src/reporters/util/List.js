import { EOL } from "os";

export default class List {
    constructor(items, prefix = "- ") {
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
