/* eslint-disable import/unambiguous */

const path = require("path");

// babel-node would use the current process.cwd() for all the config resolving logic
// That's why we use @babel/register where we can set all the options
require("@babel/register")({
    cwd: path.resolve(__dirname, "..", ".."),
});

// We're using require() instead of import() here because we need to work with the actual exports
const runExports = require("../../src/run"); // eslint-disable-line import/unambiguous
const reportersExports = require("../../src/reporters");
const errorsExports = require("../../src/errors.js");

const runMock = process.env.RUN_MOCK || "logConfigAndExit";
const runMocks = {
    logConfigAndExit(updtr) {
        console.log(
            JSON.stringify({
                updtrConfig: updtr.config,
                reporter,
                reporterConfig,
            })
        );
        process.exit(0); // eslint-disable-line no-process-exit
    },
    rejectWithAccessError() {
        return Promise.reject(
            new errorsExports.PackageJsonNoAccessError(process.cwd())
        );
    },
};
let reporterConfig;
let reporter;

// Replace run default exports with mock
runExports.default = runMocks[runMock];
reportersExports.default.dense = function (updtr, config) {
    // Removing the stream property because we can't JSON stringify that
    reporterConfig = {...config, stream: null};
    reporter = "dense";
};
reportersExports.default.error = function (updtr) {
    updtr.on("error", err => {
        console.log(JSON.stringify(err.message));
        process.exit(0); // eslint-disable-line no-process-exit
    });
};

require("../../src/bin"); // eslint-disable-line import/no-unassigned-import
