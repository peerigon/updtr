import fs from "fs";
import path from "path";
import pify from "pify";

const readFile = pify(fs.readFile);
const pathToFixtures = path.resolve(__dirname, "..", "fixtures");
const cache = new Map();

async function readFixture(fixture) {
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
}

export default (async function readFixtures(pathToFixtures) {
    const fixtures = new Map();
    const contents = await Promise.all(pathToFixtures.map(readFixture));

    contents.forEach((content, index) => {
        fixtures.set(pathToFixtures[index], content);
    });

    return fixtures;
});
