import { fromNpm, fromYarn } from "../../src/constants/dependencyTypes";

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

export default {
    npm: {
        outdated: tryParse(parsed => {
            if (parsed === null) {
                return [];
            }

            const names = Object.keys(parsed);

            return names.map(name => parsed[name]).map((dep, index) => ({
                name: names[index],
                current: dep.current,
                wanted: dep.wanted,
                latest: dep.latest,
                type: fromNpm(dep.type),
            }));
        }),
    },
    yarn: {
        outdated: tryParse(
            parsed =>
                parsed === null ?
                    [] :
                    parsed.data.body
                        .map(row => arrToObj(row, parsed.data.head))
                        .map(dep => ({
                            name: dep.Package,
                            current: dep.Current,
                            wanted: dep.Wanted,
                            latest: dep.Latest,
                            type: fromYarn(dep["Package Type"]),
                        }))
        ),
    },
};
