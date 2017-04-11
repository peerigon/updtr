import fs from "fs";
import path from "path";
import argv from "./argv";
import start from "./..";
import { YARN } from "../constants/config";
import reporters from "../reporters";

export default function () {
    const cwd = process.cwd();
    const pathToYarnLock = path.join(cwd, "yarn.lock");
    const config = { ...argv };

    config.cwd = cwd;
    config.reporter = reporters[argv.reporter];
    if (fs.existsSync(pathToYarnLock) === true) {
        config.use = YARN;
    }

    start(config);
}
