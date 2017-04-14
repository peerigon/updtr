const STRING_PROPERTIES = ["name", "current", "wanted", "latest"];

/**
 * Applies JSON.parse on the str.
 * Additionally, returns null if the str was empty or just contained whitespace.
 *
 * @param {string} str
 * @returns {*}
 */
function parse(str) {
    const trimmed = str.trim();

    if (trimmed.length === 0) {
        return null;
    }

    return JSON.parse(trimmed);
}

function returnIfValid(result) {
    STRING_PROPERTIES.forEach(prop => {
        if (typeof result[prop] !== "string") {
            throw new Error("Unexpected output format of package manager");
        }
    });

    return result;
}

function tryParse(normalizer) {
    return (stdout, cmd) => {
        try {
            return normalizer(parse(stdout));
        } catch (err) {
            err.message = `Error when trying to parse stdout from command '${ cmd }': ${ err.message }`;
            throw err;
        }
    };
}

function arrToObj(arr, keys) {
    return keys.reduce(
        (obj, key, i) => {
            obj[key] = arr[i];

            return obj;
        },
        {}
    );
}

const list = tryParse(
    parsed =>
        parsed.dependencies === undefined ?
            [] :
            Object.keys(parsed.dependencies).map(name => ({
                name,
                version: parsed.dependencies[name].version,
            }))
);

export default {
    npm: {
        outdated: tryParse(parsed => {
            if (parsed === null) {
                return [];
            }

            const names = Object.keys(parsed);

            return names.map(name => parsed[name]).map((dep, index) =>
                returnIfValid({
                    name: names[index],
                    current: dep.current,
                    wanted: dep.wanted,
                    latest: dep.latest,
                }));
        }),
        list,
    },
    yarn: {
        outdated: tryParse(
            parsed =>
                parsed === null ?
                    [] :
                    parsed.data.body
                        .map(row => arrToObj(row, parsed.data.head))
                        .map(dep =>
                              returnIfValid({
                                  name: dep.Package,
                                  current: dep.Current,
                                  wanted: dep.Wanted,
                                  latest: dep.Latest,
                              }))
        ),
        // We currently only use npm for the list command (see cmds.js).
        // Put the real implementation here if we decide to use yarn for list.
        list,
    },
};
