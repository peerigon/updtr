const runExports = require("../../src/run");
const reportersExports = require("../../src/reporters");

let reporterConfig;
let reporter;

// Replace run default exports with mock
runExports.default = function (updtr) {
    console.log(
        JSON.stringify({ updtrConfig: updtr.config, reporter, reporterConfig })
    );
    process.exit(0); // eslint-disable-line no-process-exit
};
reportersExports.default.chatty = function (updtr, config) {
    reporterConfig = config;
    reporter = "chatty";
};
reportersExports.default.simple = function (updtr, config) {
    reporterConfig = config;
    reporter = "simple";
};

require("../../src/bin");
