"use strict";

const os = require("os");

function wrap(fn) {
    return function () {
        try {
            fn.apply(this, arguments); // eslint-disable-line no-invalid-this, prefer-rest-params
        } catch (err) {
            // Reporter errors are not critical, let's just report them and go on
            console.trace(
                [
                    "Reporter error",
                    "---------------------------------------------------------------------------------",
                    err.stack,
                    "---------------------------------------------------------------------------------",
                ].join(os.EOL)
            );
        }
    };
}

module.exports = wrap;
