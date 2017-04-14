function installFn(baseCmd) {
    return ({ registry, modules } = {}) =>
        [baseCmd, stringifyRegistry(registry), stringifyModules(modules)].join(
            ""
        );
}

function stringifyModules(modules) {
    return Array.isArray(modules) === true ?
        " " +
              modules.map(({ name, version }) => name + "@" + version).join(" ") :
        "";
}

function stringifyRegistry(registry) {
    return registry === undefined ? "" : ` --registry ${ registry }`;
}

export default {
    npm: {
        outdated: () => "npm outdated --json --depth=0",
        installMissing: installFn("npm install"),
        install: installFn("npm install"),
        // remove: ({ name }) => ["npm remove ", name].join(""),
        test: () => "npm test",
    },
    // yarn does not support custom registries yet.
    // However, these renderers accept them anyway.
    yarn: {
        outdated: () => "yarn outdated --json --flat",
        installMissing: installFn("yarn"),
        install: installFn("yarn add"),
        // remove: ({ name }) => ["yarn remove ", name].join(""),
        test: () => "yarn test",
    },
};
