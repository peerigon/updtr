import path from "path";
import { erase } from "ansi-escape-sequences";

const ERASE_FROM_CURSOR_TO_END = erase.display(0);

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function replayTerminalSnapshots(pathToSnapshots) {
    const snapshots = require(path.join(process.cwd(), pathToSnapshots)); // eslint-disable-line import/no-dynamic-require

    for (const snapshotTitle of Object.keys(snapshots)) {
        const stdout = snapshots[snapshotTitle]
            // Removing double quotes
            .replace(/^.*?"|".*?$/gm, "")
            // Restoring ansi-escape-sequences
            .replace(/(\[\d)/g, "\u001b$1");
        const frames = stdout.split(ERASE_FROM_CURSOR_TO_END);
        const line = new Array(snapshotTitle.length + 1).join("-");

        console.log(line);
        console.log(snapshotTitle);
        console.log(line);

        await timeout(3000); // eslint-disable-line no-await-in-loop

        for (const frame of frames) {
            process.stdout.write(ERASE_FROM_CURSOR_TO_END + frame);
            await timeout(1000); // eslint-disable-line no-await-in-loop
        }
    }
}

if (!module.parent) {
    replayTerminalSnapshots(process.argv[2]).catch(err => {
        setImmediate(() => {
            throw err;
        });
    });
}

export default replayTerminalSnapshots;
