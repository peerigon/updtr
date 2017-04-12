import EventEmitter from "events";
import fs from "fs";
import path from "path";
import pify from "pify";
import {
    SUPPORTED_PACKAGE_MANAGERS,
    UPDATE_TO_OPTIONS,
    SAVE_OPTIONS,
} from "./constants/config";
import exec from "./exec/exec";
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
    if (SUPPORTED_PACKAGE_MANAGERS.indexOf(packageManager) === -1) {
        throw new Error(
            `Cannot create updtr instance: unsupported packager manager ${ packageManager }`
        );
    }
}

function checkUpdateTo(updateTo) {
    if (UPDATE_TO_OPTIONS.indexOf(updateTo) === -1) {
        throw new Error(
            `Cannot create updtr instance: unsupported updateTo option "${ updateTo }"`
        );
    }
}

function checkSave(save) {
    if (SAVE_OPTIONS.indexOf(save) === -1) {
        throw new Error(
            `Cannot create updtr instance: unsupported save option "${ save }"`
        );
    }
}

function checkForYarnWithCustomReg(packageManager, registry) {
    if (packageManager === "yarn" && registry !== undefined) {
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
        const updateTo = config.updateTo === undefined ?
            UPDATE_TO_OPTIONS[0] :
            config.updateTo;
        const exclude = Array.isArray(config.exclude) === true ?
            config.exclude :
            [];
        const save = config.save === undefined ? SAVE_OPTIONS[0] : config.save;

        checkCwd(cwd);
        checkPackagerManager(packageManager);
        checkForYarnWithCustomReg(packageManager, registry);
        checkUpdateTo(updateTo);
        checkSave(save);

        this.config = {
            cwd,
            use: packageManager,
            exclude,
            test: config.test,
            registry,
            updateTo,
            save,
        };
        this.cmds = cmds[packageManager];
        this.parse = parse[packageManager];

        if (typeof config.test === "string") {
            this.cmds = {
                ...this.cmds,
                test: () => config.test,
            };
        }
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
