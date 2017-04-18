import Projector from "./src/reporters/util/Projector";
import Terminal from "./src/reporters/util/Terminal";
import Spinner from "./src/reporters/util/Spinner";

const terminal = new Terminal(process.stdout);
const projector = new Projector(terminal, 10);
let lines = [
    [
        new Spinner("dots"),
        " His ddfg xfcg hcghcfgh cf cf cfg cfgh cfcfgh cfgh cfghcfgcfghcfg cfgh cfgh cfgh fg",
    ],
    [new Spinner("dots"), " yoooooo"],
    [new Spinner("dots"), " Whats up?"],
];

let counter = 0;

projector.display((lines = lines.reverse()));

setInterval(() => {
    if (counter++ % 5 === 0) {
        // terminal.flush();
    }
    projector.display((lines = lines.reverse()));
}, 1000);
