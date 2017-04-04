"use strict";

const EventEmitter = require("events");
const updateTask = require("../constants/updateTask");
const exec = require("../exec/exec");
const packageManagers = require("../constants/packageManagers");
const cmds = require("../exec/cmds");
const parse = require("../exec/parse");

function checkCwd(cwd) {
    if (typeof cwd !== "string") {
        throw new Error("Cannot create updtr instance: cwd is missing");
    }
}

function checkPackagerManager(packageManager) {
    if (packageManagers.SUPPORTED.indexOf(packageManager) === -1) {
        throw new Error(
            `Cannot create updtr instance: unsupported packager manager ${ packageManager }`
        );
    }
}

function checkForYarnWithCustomReg(packageManager, registry) {
    if (packageManager === "yarn" && registry) {
        throw new Error(
            "Cannot create updtr instance: yarn does not support custom registries yet. Please use a .npmrc file to achieve this"
        );
    }
}

class Instance extends EventEmitter {
    constructor(config) {
        super();

        const cwd = config.cwd;
        const registry = config.registry;
        const packageManager = config.packageManager === undefined ?
            "npm" :
            config.packageManager;
        const updateTo = config.wanted ? updateTask.WANTED : updateTask.LATEST;
        const exclude = Array.isArray(config.exclude) ? config.exclude : [];

        checkCwd(cwd);
        checkPackagerManager(packageManager);
        checkForYarnWithCustomReg(packageManager, registry);

        this.config = {
            cwd,
            updateTo,
            exclude,
            registry,
            packageManager,
        };
        this.cmds = cmds[packageManager];
        this.parse = parse[packageManager];
    }
    exec(cmd) {
        return exec(this.config.cwd, cmd);
    }
    dispose() {
        this.removeAllListeners();
    }
}

module.exports = Instance;
