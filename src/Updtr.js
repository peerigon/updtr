import EventEmitter from "events";
import path from "path";
import fs from "./util/fs";
import {
    USE_OPTIONS,
    UPDATE_TO_OPTIONS,
    SAVE_OPTIONS,
} from "./constants/config";
import exec from "./exec/exec";
import cmds from "./exec/cmds";
import parse from "./exec/parse";
import {
    RequiredOptionMissingError,
    OptionValueNotSupportedError,
    YarnWithCustomRegistryError,
} from "./errors";

// node v4 has no dedicated constants object.
// Remove this if node v4 is not supported anymore.
const FS_CONSTANTS = fs.constants === undefined ? fs : fs.constants;

function checkCwd(cwd) {
    if (typeof cwd !== "string") {
        throw new RequiredOptionMissingError("cwd", cwd);
    }
}

function checkUse(use) {
    if (USE_OPTIONS.indexOf(use) === -1) {
        throw new OptionValueNotSupportedError("use", use);
    }
}

function checkUpdateTo(updateTo) {
    if (UPDATE_TO_OPTIONS.indexOf(updateTo) === -1) {
        throw new OptionValueNotSupportedError("updateTo", updateTo);
    }
}

function checkSave(save) {
    if (SAVE_OPTIONS.indexOf(save) === -1) {
        throw new OptionValueNotSupportedError("save", save);
    }
}

function checkForYarnWithCustomReg(packageManager, registry) {
    if (packageManager === "yarn" && registry !== undefined) {
        throw new YarnWithCustomRegistryError();
    }
}

export default class Updtr extends EventEmitter {
    // TODO: Add typings for UpdtrConfig
    // eslint-disable-next-line
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

        const packageManager = config.use === undefined ?
            USE_OPTIONS[0] :
            config.use;

        const updateTo = config.updateTo === undefined ?
            UPDATE_TO_OPTIONS[0] :
            config.updateTo;

        const exclude = Array.isArray(config.exclude) === true ?
            config.exclude :
            [];

        const save = config.save === undefined ? SAVE_OPTIONS[0] : config.save;

        checkCwd(cwd);
        checkUse(packageManager);
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

    async canAccessPackageJson() {
        let result = true;

        try {
            await fs.access(
                path.join(this.config.cwd, "package.json"),
                FS_CONSTANTS.R_OK | FS_CONSTANTS.W_OK // eslint-disable-line no-bitwise
            );
        } catch (err) {
            result = false;
        }

        return result;
    }

    exec(cmd) {
        return exec(this.config.cwd, cmd);
    }

    readFile(filenameInCwd) {
        return fs.readFile(path.join(this.config.cwd, filenameInCwd), "utf8");
    }

    writeFile(filenameInCwd, contents) {
        return fs.writeFile(
            path.join(this.config.cwd, filenameInCwd),
            contents
        );
    }

    dispose() {
        this.removeAllListeners();
    }
}
