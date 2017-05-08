import path from "path";
import ansiEscapes from "ansi-escapes";
import wrapAnsi from "wrap-ansi";

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function replayTerminalSnapshots(pathToSnapshots) {
    const snapshots = require(path.join(process.cwd(), pathToSnapshots)); // eslint-disable-line import/no-dynamic-require

    for (const snapshotTitle of Object.keys(snapshots)) {
        const stdout = snapshots[snapshotTitle]
            // Removing double quotes
            .replace(/^.*?"|".*?$/gm, "");
        // Restoring ansi-escape-sequences
        // .replace(/(\[\d)/g, "\u001B$1");
        const frames = stdout.split(ansiEscapes.eraseDown);
        const line = new Array(snapshotTitle.length + 1).join("-");

        process.stdout.write(ansiEscapes.clearScreen);

        console.log(line);
        console.log(snapshotTitle);
        console.log(line);

        await timeout(3000); // eslint-disable-line no-await-in-loop

        for (let i = 0; i < frames.length; i++) {
            if (i !== 0) {
                process.stdout.write(ansiEscapes.eraseDown);
            }
            process.stdout.write(wrapAnsi(frames[i], 80, { hard: true }));
            await timeout(1000); // eslint-disable-line no-await-in-loop
        }
        await timeout(3000); // eslint-disable-line no-await-in-loop
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
