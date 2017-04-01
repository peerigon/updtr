"use strict";

function modulesMissingMessage(event) {
    const moduleList = event.infos.map((info) => info.name).join(", ");

    return "Some modules are not installed: " + moduleList +
           ". Please install with 'npm install' first.";
}

module.exports = {
    modulesMissingMessage,
};

