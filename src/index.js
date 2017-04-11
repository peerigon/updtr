import run from "./run";
import Updtr from "./Updtr";

export function create(config) {
    return new Updtr(config);
}

export { run };
