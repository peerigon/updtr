export default {
    npm: {
        outdated: () => "npm outdated --json --long --depth=0",
        installMissing: () => "npm install",
        install: args =>
            [
                "npm install",
                args.registry ? ` --registry ${ args.registry } ` : " ",
                args.name,
                "@",
                args.version,
            ].join(""),
        remove: args => ["npm remove ", args.name].join(""),
        test: () => "npm test",
    },
    yarn: {
        outdated: () => "yarn outdated --json --flat",
        installMissing: () => "yarn",
        install: args =>
            [
                "yarn add",
                // yarn does not support custom registries yet,
                // this will always evaluate to false
                args.registry ? ` --registry ${ args.registry } ` : " ",
                args.name,
                "@",
                args.version,
            ].join(""),
        remove: args => ["yarn remove ", args.name].join(""),
        test: () => "yarn test",
    },
};
