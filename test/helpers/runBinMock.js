const runExports = require("../../src/run");
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
reportersExports.default.chatty = function (updtr, config) {
    reporterConfig = config;
    reporter = "chatty";
};
reportersExports.default.simple = function (updtr, config) {
    reporterConfig = config;
    reporter = "simple";
};
reportersExports.default.error = function (updtr) {
    updtr.on("error", err => {
        console.log(JSON.stringify(err.message));
        process.exit(0); // eslint-disable-line no-process-exit
    });
};

require("../../src/bin");
