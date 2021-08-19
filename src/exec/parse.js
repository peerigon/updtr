const STRING_PROPERTIES = ["name", "current", "wanted", "latest"];

function isNotEmptyString(value) {
    return typeof value === "string" && value.length > 0;
}

function returnIfValid(result) {
    STRING_PROPERTIES.forEach(prop => {
        if (isNotEmptyString(result[prop]) === false) {
            throw new Error("Unexpected output format of package manager");
        }
    });

    return result;
}

function tryParse(parser) {
    return (stdout, cmd) => {
        try {
            return parser(stdout);
        } catch (err) {
            err.message = `Error when trying to parse stdout from command '${cmd}': ${err.message}`;
            throw err;
        }
    };
}

function arrToObj(arr, keys) {
    return keys.reduce((obj, key, i) => {
        obj[key] = arr[i];

        return obj;
    }, {});
}

// By sorting the parsed data, we get deterministic results across different npm and yarn versions.
// As a nice side-effect, a package like eslint will always be updated before eslint-config-peerigon
// which might have a peer dependency on eslint
// See https://github.com/peerigon/updtr/issues/48
function sortByName(o1, o2) {
    return o1.name > o2.name;
}

function npmParser(stdout) {
    const trimmed = stdout.trim();

    if (trimmed.length === 0) {
        return null;
    }

    return JSON.parse(trimmed);
}

export function splitYarnLines(stdout){
    // Yarn is using \n on all platforms now in their stdout
    return stdout.split("\n");
}

function yarnParser(stdout, wantedTypeProperty) {
    try {
        return npmParser(stdout);
    } catch (error) {
        /* in some cases (e.g. when printing the outdated result), yarn prints for each line a separate JSON object */
        /* in that case, we need to look for a { type: "table" } object which holds the interesting data to display */
    }
    const dataLine = splitYarnLines(stdout)
        .map(line => line.trim())
        .filter(line => line !== "")
        .find(line => {
            try {
                console.log(line);
                const parsedLine = JSON.parse(line);

                return parsedLine.type === wantedTypeProperty;
            } catch (error) {
                console.log(error);
                return false;
            }
        });

    if (dataLine === undefined) {
        throw new Error(`Could not find object with type === ${wantedTypeProperty}`);
    }

    return JSON.parse(dataLine);
}

const parse = {
    npm: {
        outdated: tryParse(stdout => {
            const parsed = npmParser(stdout);

            if (parsed === null) {
                return [];
            }

            const names = Object.keys(parsed);

            return names
                .map(name => parsed[name])
                .map((dep, index) =>
                    returnIfValid({
                        name: names[index],
                        current: dep.current,
                        wanted: dep.wanted,
                        latest: dep.latest,
                    })
                )
                .sort(sortByName);
        }),
        list: tryParse(stdout => {
            const parsed = npmParser(stdout);

            return (parsed.dependencies === undefined ?
                [] :
                Object.keys(parsed.dependencies)
                    .map(name => ({
                        name,
                        version: parsed.dependencies[name].version,
                    }))
                    .sort(sortByName));
        }),
    },
    yarn: {
        outdated: tryParse(
            stdout => {
                const parsed = yarnParser(stdout, "table");

                if (parsed === null) {
                    return [];
                }

                return parsed.data.body
                    .map(row => arrToObj(row, parsed.data.head))
                    .map(dep =>
                        returnIfValid({
                            name: dep.Package,
                            current: dep.Current,
                            wanted: dep.Wanted,
                            latest: dep.Latest,
                        })
                    )
                    .sort(sortByName);
            }
        ),
        list: tryParse(stdout => {
            const parsed = yarnParser(stdout, "tree");

            if (parsed.data.trees.length === 0) {
                return [];
            }

            return parsed.data.trees
                .map(dependency => {
                    const [name, version] = dependency.name.split("@");

                    if (isNotEmptyString(name) === false || isNotEmptyString(version) === false) {
                        throw new Error(`Could not parse dependency name "${dependency.name}"`);
                    }

                    return {
                        name,
                        version,
                    };
                })
                .sort(sortByName);
        }),
    },
};

export default parse;
