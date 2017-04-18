import Projector from "./src/reporters/util/Projector";
import Terminal from "./src/reporters/util/Terminal";
import Spinner from "./src/reporters/util/Spinner";
import cmdToLines from "./src/reporters/util/cmdToLines";

const terminal = new Terminal(process.stdout);
const projector = new Projector(terminal, 10);
let lines = [
    [new Spinner("dots"), " Hi"],
    [new Spinner("dots"), " yoooooo"],
    [new Spinner("dots"), " Whats up?"],
];

projector.start();

let counter = 1;

setInterval(() => {
    if (counter % 5 === 0) {
        terminal.flush();
    }
    const cmd = new Array(counter++).fill("a");

    projector.frame = lines = lines.reverse();
}, 1000);
