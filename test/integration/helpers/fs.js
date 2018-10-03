import path from "path";
import temp from "../../helpers/temp";
import fs from "../../../src/util/fs";

const pathToFixtures = path.resolve(__dirname, "..", "..", "fixtures");
let testCounter = 0;

export function createTempDir() {
    return temp.mkdir("updtr-integration-test-" + testCounter++);
}

export function read(dir, file) {
    return fs.readFile(
        // If dir is an absolute path, pathToFixtures will just be ignored
        path.resolve(pathToFixtures, dir, file),
        "utf8"
    );
}

export function write(dir, file, contents) {
    return fs.writeFile(
        // If dir is an absolute path, pathToFixtures will just be ignored
        path.resolve(dir, file),
        contents
    );
}
