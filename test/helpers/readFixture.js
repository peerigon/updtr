"use strict";

const fs = require("fs");
const path = require("path");

const pathToFixtures = path.resolve(__dirname, "..", "fixtures");
const cache = new Map();

function readFixture(fixture) {
    let filename;

    return new Promise((resolve, reject) => {
        filename = path.join(pathToFixtures, fixture);

        const cached = cache.get(filename);

        if (cached !== undefined) {
            resolve(cached);

            return;
        }

        fs.readFile(filename, "utf8", (err, contents) => {
            if (err) {
                return void reject(err);
            }

            return void resolve(contents);
        });
    }).then(contents => {
        if (cache.has(filename) === false) {
            cache.set(filename, contents);
        }

        return contents;
    });
}

module.exports = readFixture;
