"use strict";

exports.noOutdated = {};

exports.outdated = {
    type: "table",
    data: {
        head: ["Package", "Current", "Wanted", "Latest", "Package Type", "URL"],
        body: [
            [
                "unicons",
                "0.1.4",
                "1.1.5",
                "2.0.0",
                "dependencies",
            ],
        ],
    },
};

exports.outdatedExclude = {
    type: "table",
    data: {
        head: ["Package", "Current", "Wanted", "Latest", "Package Type", "URL"],
        body: [
            [
                "servus.js",
                "1.1.4",
                "1.1.5",
                "2.0.0",
                "dependencies",
            ], [
                "servus.jsShouldNotBeExclued",
                "1.1.4",
                "1.1.5",
                "2.0.0",
                "dependencies",
            ], [
                "unicons",
                "0.1.4",
                "1.1.5",
                "2.0.0",
                "dependencies",
            ],
        ],
    },
};

exports.outdatedUnstable = {
    type: "table",
    data: {
        head: ["Package", "Current", "Wanted", "Latest", "Package Type", "URL"],
        body: [
            [
                "servus.js",
                "0.1.4",
                "1.1.5",
                "2.0.0-beta",
                "dependencies",
            ], [
                "xunit-file",
                "0.1.4",
                "1.1.5",
                "2.0.0-alpha",
                "dependencies",
            ], [
                "npm-stats",
                "0.1.4",
                "1.1.5",
                "2.0.0-rc",
                "dependencies",
            ], [
                "unicons",
                "0.1.4",
                "1.1.5",
                "2.0.0",
                "dependencies",
            ],
        ],
    },
};

exports.outdatedWithGitDependencies = {
    type: "table",
    data: {
        head: ["Package", "Current", "Wanted", "Latest", "Package Type", "URL"],
        body: [
            [
                "unicons",
                "0.1.4",
                "1.1.5",
                "2.0.0",
                "dependencies",
            ], [
                "xunit-file",
                "0.0.7",
                "exotic",
                "exotic",
                "dependencies",
            ], [
                "servus.js",
                "0.0.1",
                "exotic",
                "exotic",
                "dependencies",
            ],
        ],
    },
};

exports.outdatedVersionGreaterThanLatest = {
    type: "table",
    data: {
        head: ["Package", "Current", "Wanted", "Latest", "Package Type", "URL"],
        body: [
            [
                "xunit-file",
                "0.1.4",
                "1.1.5",
                "2.0.0",
                "dependencies",
            ], [
                "unicons",
                "0.1.0",
                "0.0.5",
                "0.0.5",
                "dependencies",
            ], [
                "servus.js",
                "0.1.0-alpha",
                "0.0.5",
                "0.0.5",
                "dependencies",
            ], [
                "babel-eslint",
                "6.0.0-beta.6",
                "5.0.0",
                "5.0.0",
                "dependencies",
            ],
        ],
    },
};
