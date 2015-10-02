"use strict";

var runsync = require("runsync");
var colors = require("colors");
var outdatedModules;
var execOptions = { stdio: [null, null, null] };
var counter = 1;
var outdated = runsync.popen("npm outdated --json --long --depth=0", { input: "stdin", encoding: "utf8" }).stdout;

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
        return info.latest !== "git";
    })
    .filter(function (info, index, outdatedModules) {
        try {
            process.stdout.write(
                colors.grey("(" + counter++ + "/" + outdatedModules.length + ")") + "\t" + info.name + "\t".grey + info.current + " " + symbols.arrow.gray + " " + info.latest + " "
            );
            runsync.exec("npm r " + info.name + "--save --save-dev", execOptions);
            runsync.exec("npm i " + info.name + "@" + info.latest + " " + info.saveCmd, execOptions);
            try {
                runsync.exec("npm test", execOptions);
                process.stdout.write(
                    symbols.ok.green + "\n"
                );
                return true;
            } catch (err) {
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write(
                    colors.grey("(" + counter++ + "/" + outdatedModules.length + ")") + "\t" + info.name.red + "\t".grey + info.current + " " + symbols.arrow.gray + " " + info.latest + " " + symbols.err.red + "\n"
                );
                runsync.exec("npm i " + info.name + "@" + info.current + " " + info.saveCmd, execOptions);
                return false;
            }
        } catch (err) {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(
                colors.grey("(" + counter++ + "/" + outdatedModules.length + ")") + "\t" + info.name.red + "\t".grey + info.current + " " + symbols.arrow.gray + " " + info.latest + " " + symbols.err.red + "\n"
            );
            runsync.exec("npm i " + info.name + "@" + info.current + " " + info.saveCmd, execOptions);
            return false;
        }
    });

console.log("");
console.log("Finished.");
