export default {
    npm: {
        outdated: () => "npm outdated --json --long --depth=0",
        installMissing: () => "npm install",
        install: ({ registry, modules }) =>
            [
                "npm install",
                registry ? ` --registry ${ registry } ` : " ",
                ...modules.map(({ name, version }) => name + "@" + version),
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
                ...modules.map(({ name, version }) => name + "@" + version),
            ].join(""),
        // remove: ({ name }) => ["yarn remove ", name].join(""),
        test: () => "yarn test",
    },
};
