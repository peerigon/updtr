"use strict";

const REGULAR = "regular";
const DEV = "dev";
const OPTIONAL = "optional";

function fromNpm(type) {
    switch (type) {
        case "dependencies":
            return REGULAR;
        case "devDependencies":
            return DEV;
        case "optionalDependencies":
            return OPTIONAL;
        default:
            throw new Error(`Unsupported dependency type: ${ type }`);
    }
}

exports.REGULAR = REGULAR;
exports.DEV = DEV;
exports.OPTIONAL = OPTIONAL;

exports.fromNpm = fromNpm;
// yarn uses the same strings. Change this if necessary.
exports.fromYarn = fromNpm;
