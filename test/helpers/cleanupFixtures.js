"use strict";

const path = require("path");
const rimraf = require("rimraf");

const pathToFixtures = path.resolve(__dirname, "..", "fixtures");
const fixtures = [
    "empty",
    "no-outdated",
    "outdated",
    "outdated-dev",
];
const thingsToRemove = [
    "node_modules",
    "outdated.npm.log",
    "outdated.yarn.log",
    "yarn.lock",
];

function cleanupFixtures() {
    fixtures.forEach(fixture => {
        thingsToRemove.forEach(thing => {
            rimraf.sync(path.join(pathToFixtures, fixture, thing));
        });
    });
}

if (!module.parent) {
    cleanupFixtures();
}

module.exports = cleanupFixtures;
