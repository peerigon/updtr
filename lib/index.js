"use strict";

var async = require("async");
var exec = require("child_process").exec;
var colors = require("colors");

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

exec("npm outdated --json --long --depth=0", { encoding: "utf8" }, function (err, stdout, stderr) {
    var outdated;
    var outdatedPackages;
    var tasks;

    function createTask(info, index, outdatedModules) {
        index++;
        return function (done) {
            process.stdout.write(
                colors.grey("(" + index + "/" + outdatedModules.length + ")") + "\t" + info.name + "\tupdating ".grey + info.current + " " + symbols.arrow.gray + " " + info.latest + " ... ".grey
            );
            async.series({
                updateModule: async.apply(exec, "npm i " + info.name + "@" + info.latest + " " + info.saveCmd),
                updateConsole: function (done) {
                    process.stdout.write("tests: ");
                    setImmediate(done);
                },
                runTests: async.apply(exec, "npm test")
            }, function (err) {
                if (err) {
                    process.stdout.clearLine();
                    process.stdout.cursorTo(0);
                    process.stdout.write(
                        colors.grey("(" + index + "/" + outdatedModules.length + ")") + "\t" + info.name.red + "\tupdating ".grey + info.current + " " + symbols.arrow.gray + " " + info.latest + " ... ".grey +
                        "tests: " + symbols.err.red + " ... ".grey + "rolling back changes " + " ...".grey + "\n"
                    );
                    exec("npm i " + info.name + "@" + info.current + " " + info.saveCmd, done);
                    return;
                }
                process.stdout.write(
                    symbols.ok.green + "\n"
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
    outdatedPackages = Object.keys(outdated);
    console.log("Found %s outdated module%s", outdatedPackages.length, outdatedPackages.length === 1 ? "" : "s");
    console.log("");
    console.log("Starting to update your modules...");

    tasks = outdatedPackages
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

    async.series(tasks, function (err) {
        if (err) {
            throw err;
        }
        console.log("");
        console.log("Finished.");
    });
});
