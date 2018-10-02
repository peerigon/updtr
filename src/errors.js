// Errors are not extendable in node v4.
// Remove this if node v4 is not supported anymore.
import Error from "es6-error";

export class PackageJsonNoAccessError extends Error {
    constructor(dir) {
        super(`Cannot access package.json in ${dir}`);
    }
}

export class RequiredOptionMissingError extends Error {
    constructor(optionName, optionValue) {
        super(
            `Required option ${optionName} is missing. Instead received ${optionValue}`
        );
    }
}

export class OptionValueNotSupportedError extends Error {
    constructor(optionName, unsupportedValue) {
        super(`Unsupported value ${unsupportedValue} for option ${optionName}`);
    }
}

export class YarnWithCustomRegistryError extends Error {
    constructor() {
        super(
            "yarn does not support custom registries yet. Please use a .npmrc file to achieve this"
        );
    }
}
