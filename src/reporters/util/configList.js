import {
    USE_OPTIONS,
    UPDATE_TO_OPTIONS,
    SAVE_OPTIONS,
} from "../../constants/config";

const configNames = {
    use: "use",
    exclude: "exclude",
    test: "test command",
    registry: "registry",
    updateTo: "update to",
    save: "save",
};
const configValues = {
    exclude: list => list.join(", "),
};
const configFilter = {
    cwd: () => false,
    use: option => option !== USE_OPTIONS[0],
    exclude: list => list.length > 0,
    updateTo: option => option !== UPDATE_TO_OPTIONS[0],
    save: option => option !== SAVE_OPTIONS[0],
};

export default function configList(config) {
    return Object.keys(config)
        .filter(key => {
            const filter = configFilter[key];
            const name = configNames[key];

            return (
                name !== undefined &&
                (filter === undefined || filter(config[key]) === true)
            );
        })
        .map(key => {
            const toString = configValues[key] || String;

            return `${ configNames[key] }: ${ toString(config[key]) }`;
        });
}
