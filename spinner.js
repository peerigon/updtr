import Projector from "./src/reporters/util/Projector";
import Terminal from "./src/reporters/util/Terminal";
import Spinner from "./src/reporters/util/Spinner";

const terminal = new Terminal(process.stdout);
const projector = new Projector(terminal, 10);
let lines = [
    [new Spinner("dots"), " " + new Array(50).fill("a")],
    [new Spinner("dots"), " " + new Array(50).fill("b")],
    [new Spinner("dots"), " " + new Array(50).fill("c")],
];

let counter = 0;

terminal.append(lines.map(line => line.join("")));

projector.display((lines = lines.reverse()));

setInterval(() => {
    if (counter++ % 5 === 0) {
        // terminal.flush();
    }
    projector.display((lines = lines.reverse()));
}, 1000);
