"use strict";

const createUpdtr = require("./createUpdtr");
const tasks = require("./tasks");

function run(config, done) {
    let updtr;

    return Promise.resolve()
        .then(() => {
            updtr = createUpdtr(config);

            return tasks.init(updtr);
        })
        .then(updateTasks => tasks.update(updtr, updateTasks))
        .then(() => updtr.emit("done"));
}

module.exports = run;
