"use strict";

const createInstance = require("./createInstance");
const tasks = require("./tasks");

function run(config, done) {
    let instance;

    return Promise.resolve()
        .then(() => {
            instance = createInstance(config);

            return tasks.init(instance);
        })
        .then(updateTasks => tasks.update(instance, updateTasks))
        .then(() => instance.emit("done"));
}

module.exports = run;
