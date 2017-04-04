export const REGULAR = "regular";
export const DEV = "dev";
export const OPTIONAL = "optional";

export function fromNpm(type) {
    switch (type) {
        case "dependencies":
            return REGULAR;
        case "devDependencies":
            return DEV;
        case "optionalDependencies":
            return OPTIONAL;
        default:
            throw new Error(`Unsupported dependency type: ${ type }`);
    }
}

export {
    // yarn uses the same strings. Change this if necessary.
    fromNpm as fromYarn,
};
