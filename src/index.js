import run from "./run";
import Updtr from "./Updtr";

function start(config) {
    const updtr = new Updtr(config);
    const reporter = config.reporter;

    if (reporter !== undefined) {
        reporter(updtr);
    }

    return run(updtr);
}

// For CommonJS compatibility
module.exports = start;
export default start;
