"use strict";

var events = require("events");
var EventEmitter = events;

if (typeof EventEmitter !== "function") {
    EventEmitter = events.EventEmitter;
}

module.exports = EventEmitter;
