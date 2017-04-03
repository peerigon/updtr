"use strict";

const path = require("path");
const rimraf = require("rimraf");
const setupFixtures = require("./setupFixtures");

const pathToFixtures = path.resolve(__dirname, "..", "fixtures");
const fixtures = Object.keys(setupFixtures);

function remove(fixture) {
    return new Promise((resolve, reject) => {
        rimraf(path.join(pathToFixtures, fixture), err => {
            if (err) {
                throw err;
            }
            resolve();
        });
    });
}

function cleanupFixtures() {
    fixtures.forEach(remove);
}

if (!module.parent) {
    cleanupFixtures();
}

module.exports = cleanupFixtures;
