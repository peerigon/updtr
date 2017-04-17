import unicons from "unicons";
import chalk from "chalk";

export const INDICATOR_NEUTRAL = 0;
export const INDICATOR_FAIL = 1;
export const INDICATOR_PENDING = 2;
export const INDICATOR_OK = 3;

const COLORS = [chalk.grey, chalk.red, chalk.yellow, chalk.green];

export default class Indicator {
    constructor(initialState = INDICATOR_NEUTRAL) {
        this.state = initialState;
    }
    valueOf() {
        return COLORS[this.state](unicons.cli("circle"));
    }
    toString() {
        return this.valueOf();
    }
}
