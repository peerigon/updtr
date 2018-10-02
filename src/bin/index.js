import reporters from "../reporters";
import argv from "./argv";
import {create, run} from "..";

async function start() {
    const cwd = process.cwd();
    const config = {...argv};
    const reporterConfig = {
        stream: process.stdout,
        testStdout: argv.testStdout,
    };
    const reporter = reporters[argv.reporter];

    config.cwd = cwd;

    const updtr = create(config);

    reporter(updtr, reporterConfig);
    try {
        await run(updtr);
    } catch (err) {
        updtr.emit("error", err);
    }
}

start();
