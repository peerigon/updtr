function stringifyModules(modules) {
    return modules.map(({ name, version }) => name + "@" + version).join(" ");
}

export default {
    npm: {
        outdated: () => "npm outdated --json --depth=0",
        installMissing: () => "npm install",
        install: ({ registry, modules }) =>
            [
                "npm install",
                registry ? ` --registry ${ registry } ` : " ",
                stringifyModules(modules),
            ].join(""),
        // remove: ({ name }) => ["npm remove ", name].join(""),
        test: () => "npm test",
    },
    yarn: {
        outdated: () => "yarn outdated --json --flat",
        installMissing: () => "yarn",
        install: ({ registry, modules }) =>
            [
                "yarn add",
                // yarn does not support custom registries yet,
                // this will always evaluate to false
                registry ? ` --registry ${ registry } ` : " ",
                stringifyModules(modules),
            ].join(""),
        // remove: ({ name }) => ["yarn remove ", name].join(""),
        test: () => "yarn test",
    },
};
