import pify from "pify";
import temp from "temp";

temp.track();

process.on("exit", () => {
    temp.cleanupSync();
});

export default pify(temp);
