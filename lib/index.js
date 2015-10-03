"use strict";

var run = require("./run.js");

exports.run = run;
exports.reporters = {
    default: require("./reporters/default.js"),
    shy: require("./reporters/shy.js")
};
