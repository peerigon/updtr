import fs from "fs";
import path from "path";
import pify from "pify";

const readFile = pify(fs.readFile);
const pathToFixtures = path.resolve(__dirname, "..", "fixtures");
const cache = new Map();

export default (async function readFixture(fixture) {
    const filename = path.join(pathToFixtures, fixture);
    const cached = cache.get(filename);

    if (cached !== undefined) {
        return cached;
    }

    const contents = await readFile(filename, "utf8");

    if (cache.has(filename) === false) {
        cache.set(filename, contents);
    }

    return contents;
});
