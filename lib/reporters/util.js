"use strict";

function modulesMissingMessage(event) {
    var moduleList = event.infos.map(function (info) {
        return info.name;
    }).join(", ");

    return "Some modules are not installed: " + moduleList +
           ". Please install with 'npm install' first.";
}

module.exports = {
    modulesMissingMessage: modulesMissingMessage,
};

