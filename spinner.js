import Projector from "./src/reporters/util/Projector";
import Terminal from "./src/reporters/util/Terminal";
import Line from "./src/reporters/util/Line";
import Spinner from "./src/reporters/util/Spinner";
import cmdToLines from "./src/reporters/util/cmdToLines";

const terminal = new Terminal(process.stdout);
const projector = new Projector(terminal, 10);
let lines = [
    new Line(new Spinner("dots"), " Hi"),
    new Line(new Spinner("dots"), " Yooo"),
    new Line(new Spinner("dots"), " What's up broooo?"),
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
