const configNames = {
    use: "Use",
    exclude: "Exclude",
    test: "Test command",
    registry: "Registry",
    updateTo: "Update to",
    save: "Save",
};
const configValues = {
    exclude: list => list.join(", "),
};
const configFilter = {
    cwd: () => false,
    exclude: list => list.length > 0,
};

export default function configList(config) {
    return Object.keys(config)
        .filter(key => {
            const filter = configFilter[key];
            const value = config[key];

            if (filter === undefined) {
                return Boolean(value);
            }

            return filter(value);
        })
        .map(key => {
            let configName = configNames[key];
            let configValue = configValues[key];

            if (configName === undefined) {
                configName = "";
            } else {
                configName += ": ";
            }
            if (configValue === undefined) {
                configValue = String(config[key]);
            } else {
                configValue = configValue(config[key]);
            }

            return configName + configValue;
        });
}
