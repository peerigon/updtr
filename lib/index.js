"use strict";

var async = require("async");
var exec = require("child_process").exec;
var colors = require("colors");
var Spinner = require("cli-spinner").Spinner;
var spinner;

var symbols = {
    ok: "✓",
    err: "✖",
    arrow: "→"
};

if (process.platform === "win32") {
    symbols.ok = "\u221A";
    symbols.err = "\u00D7";
    symbols.arrow = "\u2192";
}

log("Looking for outdated modules... ");
exec("npm outdated --json --long --depth=0", { encoding: "utf8" }, function (err, stdout, stderr) {
    var outdated;
    var tasks;

    function createTask(info, index) {
        index++;
        return function (done) {
            var msg = colors.grey("(" + index + "/" + tasks.length + ")") + "\t" + info.name + "\tupdating ".grey + info.current + " " + symbols.arrow.gray + " " + info.latest + " ... ".grey;

            log(msg);
            async.series({
                updateModule: async.apply(exec, "npm i " + info.name + "@" + info.latest + " " + info.saveCmd),
                updateConsole: function (done) {
                    msg = msg + "\ttests: ";
                    log(msg);
                    setImmediate(done);
                },
                runTests: async.apply(exec, "npm test")
            }, function (err) {
                if (err) {
                    log(
                        msg = colors.grey("(" + index + "/" + tasks.length + ")") + "\t" + info.name.red + "\tupdating ".grey + info.current + " " + symbols.arrow.gray + " " + info.latest + " ... ".grey +
                        "\ttests: " + symbols.err.red + " ... ".grey + "\trolling back to " + info.current + " ... ".grey
                    );
                    exec("npm i " + info.name + "@" + info.current + " " + info.saveCmd, function () {
                        spinner.stop();
                        clear();
                        process.stdout.write(
                            msg + symbols.ok.grey + "\n"
                        );
                        done();
                    });
                    return;
                }
                spinner.stop();
                clear();
                process.stdout.write(
                    msg + symbols.ok.green + "\n"
                );
                done();
            });
        };
    }

    if (err) {
        throw err;
    }

    if (stdout === "") {
        console.log("No outdated modules found");
        process.exit(0);
        return;
    }

    outdated = JSON.parse(stdout);

    tasks = Object.keys(outdated)
        .map(function (moduleName) {
            var info = outdated[moduleName];

            info.name = moduleName;
            info.saveCmd = info.type === "devDependencies" ? "--save-dev" : "--save";

            return info;
        })
        .filter(function (info) {
            return info.latest !== "git";
        })
        .map(function (info, index, outdatedModules) {
            return createTask(info, index, outdatedModules);
        });

    spinner.stop(true);
    console.log("Found %s outdated module%s", tasks.length, tasks.length === 1 ? "" : "s");
    console.log("");
    console.log("Starting to update your modules...");

    async.series(tasks, function (err) {
        if (err) {
            throw err;
        }
        console.log("");
        console.log("Finished.");
        spinner.stop();
    });
});

function log(message) {
    if (spinner) {
        spinner.stop();
    }
    spinner = new Spinner(message + "%s ");
    spinner.setSpinnerString(10);
    spinner.start();
}

function clear() {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
}
