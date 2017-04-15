import fs from "fs";
import path from "path";
import argv from "./argv";
import { create, run } from "./..";
import { USE_YARN } from "../constants/config";
import reporters from "../reporters";

async function start() {
    const cwd = process.cwd();
    const pathToYarnLock = path.join(cwd, "yarn.lock");
    const config = { ...argv };
    const reporterConfig = { testStdout: argv.testStdout };
    const reporter = reporters[argv.reporter];

    config.cwd = cwd;
    if (fs.existsSync(pathToYarnLock) === true) {
        config.use = USE_YARN;
    }

    const updtr = create(config);

    reporter(updtr, reporterConfig);
    try {
        await run(updtr);
    } catch (err) {
        updtr.emit("error", err);
    }
}

start();
