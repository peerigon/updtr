function installFn(baseCmd) {
    return ({registry, modules} = {}) =>
        [baseCmd, stringifyRegistry(registry), stringifyModules(modules)].join(
            ""
        );
}

function stringifyModules(modules) {
    return Array.isArray(modules) === true ?
        " " +
              modules
                  // We need to wrap this in double-quotes because some semver
                  // characters like the caret symbol are reserved characters on Windows.
                  .map(({name, version}) => `"${name}@${version}"`)
                  .join(" ") :
        "";
}

function stringifyRegistry(registry) {
    return registry === undefined ? "" : ` --registry "${registry}"`;
}

const cmds = {
    npm: {
        outdated: () => "npm outdated --json --depth=0",
        installMissing: installFn("npm install"),
        install: installFn("npm install"),
        // remove: ({ name }) => ["npm remove ", name].join(""),
        test: () => "npm test",
        list: ({modules} = {}) => [
            "npm ls --json --depth=0",
            Array.isArray(modules) === true ? " " + modules.join(" ") : "",
        ].join(""),
    },
    // yarn does not support custom registries yet.
    // However, these renderers accept them anyway.
    yarn: {
        outdated: () => "yarn outdated --json --flat",
        installMissing: installFn("yarn"),
        install: installFn("yarn add"),
        // remove: ({ name }) => ["yarn remove ", name].join(""),
        test: () => "yarn test",
        list: ({modules} = {}) => [
            "yarn list --json --depth=0",
            Array.isArray(modules) === true ? " " + modules.join(" ") : "",
        ].join(""),
    },
};

export default cmds;
