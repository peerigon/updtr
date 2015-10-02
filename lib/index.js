"use strict";

var runsync = require("runsync");
var Table = require("cli-table");
var updated = [];
var failed = [];
var skipped = [];
var errors = [];
var outdatedModules;
var execOptions = { stdio: [null, null, null] };
var i;
var counter = 1;
var table;
var outdated = runsync.popen("npm outdated --json --long --depth=0", { input: "stdin", encoding: "utf8" }).stdout;

var symbols = {
    ok: "✓",
    err: "✖",
    skip: "-"
};

if (process.platform === "win32") {
    symbols.ok = "\u221A";
    symbols.err = "\u00D7";
    symbols.skip = ".";
}

// Extend String.prototype with color properties
require("colors");

if (outdated === "") {
    console.log("No outdated modules found");
    process.exit(0);
}

outdated = JSON.parse(outdated);
outdatedModules = Object.keys(outdated).length;
console.log("Found %s outdated module%s", outdatedModules, outdatedModules === 1 ? "" : "s");
console.log("");
console.log("Starting to update your modules...");
Object.keys(outdated)
    .map(function (moduleName, index) {
        var info = outdated[moduleName];

        info.name = moduleName;
        info.saveCmd = info.type === "devDependencies" ? "--save-dev" : "--save";

        return info;
    })
    .filter(function (info) {
        var skip = info.latest === "git";

        if (skip) {
            console.log(
                "(" + counter++ + "/" + outdatedModules + ")\t" + info.name + " (git dependency) " + symbols.skip.grey + "\n"
            );
            skipped.push(info.name);
            return false;
        }
        return true;
    })
    .filter(function (info) {
        try {
            process.stdout.write(
                "(" + counter++ + "/" + outdatedModules + ")\t" + info.name + "@" + info.current + " >> " + info.latest + " "
            );
            runsync.exec("npm r " + info.name + "--save --save-dev", execOptions);
            runsync.exec("npm i " + info.name + "@" + info.latest + " " + info.saveCmd, execOptions);
            try {
                runsync.exec("npm test", execOptions);
                updated.push(info.name);
                process.stdout.write(
                    symbols.ok.green + "\n"
                );
                return true;
            } catch (err) {
                process.stdout.write(
                    symbols.err.red + "\n"
                );
                runsync.exec("npm i " + info.name + "@" + info.current + " " + info.saveCmd, execOptions);
                failed.push(info.name);
                return false;
            }
        } catch (err) {
            process.stdout.write(
                symbols.err.red + "\n"
            );
            errors.push(info.name);
            runsync.exec("npm i " + info.name + "@" + info.current + " " + info.saveCmd, execOptions);
            return false;
        }
    });

table = new Table({
    head: ["updated".green, "failed".red, "error".red, "skipped".grey],
    colWidths: [25, 25, 25, 25]
});

for (i = 0; i < Math.max(updated.length, failed.length, errors.length, skipped.length); i++) {
    table.push(
        [updated[i] || "", failed[i] || "", errors[i] || "", skipped[i] || ""]
    );
}
console.log("");
console.log("Results:");
console.log(table.toString());
