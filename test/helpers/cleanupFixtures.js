import path from "path";
import pify from "pify";
import rimraf from "rimraf";
import {fixtureSetups} from "./setupFixtures";

const pathToFixtures = path.resolve(__dirname, "..", "fixtures");
const fixtures = Object.keys(fixtureSetups);
const promiseRimraf = pify(rimraf);

function remove(fixture) {
    return promiseRimraf(
        path.join(pathToFixtures, fixture),
    );
}

export default function cleanupFixtures() {
    return Promise.all(fixtures.map(remove));
}

if (!module.parent) {
    process.on("unhandledRejection", error => {
        console.error(error.stack);
        process.exit(1); // eslint-disable-line no-process-exit
    });
    cleanupFixtures();
}
