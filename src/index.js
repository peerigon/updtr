import run from "./run";
import Updtr from "./Updtr";
import * as errors from "./errors";

export function create(config) {
    return new Updtr(config);
}

export { errors, run };
