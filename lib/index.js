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
var table;
var outdated = runsync.popen("npm outdated --json --long --depth=0", { input: "stdin", encoding: "utf8" }).stdout;

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
        info.counter = "(" + ++index + "/" + outdatedModules + ")";
        info.saveCmd = info.type === "devDependencies" ? "--save-dev" : "--save";

        return info;
    })
    .filter(function (info) {
        var skip = info.latest === "git";

        if (skip) {
            console.log(info.counter + " skipped".grey + "\t" + info.name + " (git dependency)");
            skipped.push(info.name);
            return false;
        }
        return true;
    })
    .filter(function (info) {
        try {
            runsync.exec("npm r " + info.name + "--save --save-dev", execOptions);
            runsync.exec("npm i " + info.name + "@" + info.latest + " " + info.saveCmd, execOptions);
            return true;
        } catch (err) {
            console.log(
                info.counter + " error".red + "\t" + info.name + "@" + info.current + " >> " + info.latest
            );
            errors.push(info.name);
            runsync.exec("npm i " + info.name + "@" + info.current + " " + info.saveCmd, execOptions);
            return false;
        }
    })
    .forEach(function (info) {
        try {
            runsync.exec("npm test", execOptions);
            updated.push(info.name);
            console.log(
                info.counter + " success".green + "\t" + info.name + "@" + info.current + " >> " + info.latest
            );
        } catch (err) {
            console.log(
                info.counter + " fail".red + "\t" + info.name + "@" + info.current + " >> " + info.latest
            );
            runsync.exec("npm i " + info.name + "@" + info.current + " " + info.saveCmd, execOptions);
            failed.push(info.name);
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
