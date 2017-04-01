"use strict";

exports.noOutdated = {};

exports.outdated = {
    unicons: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "unicons",
        type: "dependencies",
    },
};

exports.outdatedNotInstalled = {
    "servus.js": {
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "",
        type: "dependencies",
    },
    unicons: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "unicons",
        type: "dependencies",
    },
};

exports.outdatedUnstable = {
    "servus.js": {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0-beta",
        location: "unicons",
        type: "dependencies",
    },
    "xunit-file": {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0-alpha",
        location: "unicons",
        type: "dependencies",
    },
    "npm-stats": {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0-rc",
        location: "unicons",
        type: "dependencies",
    },
    unicons: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "unicons",
        type: "dependencies",
    },
};

exports.outdatedExclude = {
    "servus.js": {
        current: "1.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "unicons",
        type: "dependencies",
    },
    "servus.jsShouldNotBeExcluded": {
        current: "1.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "servus.jsShouldNotBeExcluded",
        type: "dependencies",
    },
    unicons: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "unicons",
        type: "dependencies",
    },
};

exports.outdatedUnstable = {
    "servus.js": {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0-beta",
        location: "unicons",
        type: "dependencies",
    },
    "xunit-file": {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0-alpha",
        location: "unicons",
        type: "dependencies",
    },
    "npm-stats": {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0-rc",
        location: "unicons",
        type: "dependencies",
    },
    unicons: {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "unicons",
        type: "dependencies",
    },
};

exports.outdatedWithGitDependencies = {
    unicons: exports.outdated.unicons,
    "xunit-file": {
        current: "0.0.7",
        wanted: "git",
        latest: "git",
        location: "xunit-file",
        type: "dependencies",
    },
    "servus.js": {
        current: "0.0.1",
        wanted: "git",
        latest: "git",
        location: "servus.js",
        type: "dependencies",
    },
};

exports.outdatedVersionGreaterThanLatest = {
    "xunit-file": {
        current: "0.1.4",
        wanted: "1.1.5",
        latest: "2.0.0",
        location: "xunit-file",
        type: "dependencies",
    },
    unicons: {
        current: "0.1.0",
        wanted: "0.0.5",
        latest: "0.0.5",
        location: "unicons",
        type: "dependencies",
    },
    "servus.js": {
        current: "0.1.0-alpha",
        wanted: "0.0.5",
        latest: "0.0.5",
        location: "servus.js",
        type: "dependencies",
    },
    "babel-eslint": {
        current: "6.0.0-beta.6",
        wanted: "5.0.0",
        latest: "5.0.0",
        location: "babel-eslint",
        type: "dependencies",
    },
};
