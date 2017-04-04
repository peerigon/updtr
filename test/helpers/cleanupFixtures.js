import path from "path";
import rimraf from "rimraf";
import { fixtureSetups } from "./setupFixtures";

const pathToFixtures = path.resolve(__dirname, "..", "fixtures");
const fixtures = Object.keys(fixtureSetups);

function remove(fixture) {
    return new Promise((resolve, reject) => {
        rimraf(
            path.join(pathToFixtures, fixture),
            err => err ? reject(err) : resolve
        );
    });
}

export default function cleanupFixtures() {
    return Promise.all(fixtures.map(remove));
}

if (!module.parent) {
    cleanupFixtures().catch(err => {
        setImmediate(() => {
            throw err;
        });
    });
}
