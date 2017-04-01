"use strict";

const events = require("events");

let EventEmitter = events;

if (typeof EventEmitter !== "function") {
    EventEmitter = events.EventEmitter;
}

module.exports = EventEmitter;
