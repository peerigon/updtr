export default class Message {
    constructor(template, variables) {
        this.template = template;
        this.variables = variables;
    }

    valueOf() {
        const split = this.template.split(/%s/g);

        return split.reduce(
            (str, part, i) => str + part + (this.variables[i] || ""),
            ""
        );
    }

    toString() {
        return this.valueOf();
    }
}
