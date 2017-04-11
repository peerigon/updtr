import fs from "fs";
import path from "path";
import argv from "./argv";
import { create, run } from "./..";
import { YARN } from "../constants/config";
import reporters from "../reporters";

function start() {
    const cwd = process.cwd();
    const pathToYarnLock = path.join(cwd, "yarn.lock");
    const config = { ...argv };
    const reporterConfig = { testStdout: argv.testStdout };
    const reporter = reporters[argv.reporter];

    config.cwd = cwd;
    if (fs.existsSync(pathToYarnLock) === true) {
        config.use = YARN;
    }

    const updtr = create(config);

    reporter(updtr, reporterConfig);
    run(updtr);
}

start();
