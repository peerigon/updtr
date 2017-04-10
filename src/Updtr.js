import EventEmitter from "events";
import fs from "fs";
import path from "path";
import pify from "pify";
import { UPDATE_TO_LATEST, UPDATE_TO_WANTED } from "./constants/updateTask";
import exec from "./exec/exec";
import { SUPPORTED } from "./constants/packageManagers";
import cmds from "./exec/cmds";
import parse from "./exec/parse";

const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);

function checkCwd(cwd) {
    if (typeof cwd !== "string") {
        throw new Error("Cannot create updtr instance: cwd is missing");
    }
}

function checkPackagerManager(packageManager) {
    if (SUPPORTED.indexOf(packageManager) === -1) {
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

export default class Updtr extends EventEmitter {
    /**
     * The config passed-in here should look identically to the CLI config.
     * Dash-cased properties should be renamed to camelCased.
     * The goal is to replicate the API of the CLI as close as possible so users don't
     * have to guess the options.
     *
     * @param {UpdtrConfig} config
     */
    constructor(config) {
        super();

        const cwd = config.cwd;
        const registry = config.registry;
        const packageManager = config.use === undefined ? "npm" : config.use;
        const updateTo = config.wanted ? UPDATE_TO_WANTED : UPDATE_TO_LATEST;
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
    readFile(filenameInCwd) {
        return readFile(path.join(this.config.cwd, filenameInCwd), "utf8");
    }
    writeFile(filenameInCwd, contents) {
        return writeFile(path.join(this.config.cwd, filenameInCwd), contents);
    }
    dispose() {
        this.removeAllListeners();
    }
}
