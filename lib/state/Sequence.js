"use strict";

class Sequence {
    constructor(instance, baseEvent) {
        this.instance = instance;
        this.baseEvent = baseEvent;
        this.stdouts = new Map();
    }
    emit(eventName, event) {
        this.instance.emit(
            eventName,
            Object.assign(event === undefined ? {} : event, this.baseEvent)
        );
    }
    exec(step, cmd) {
        return new Promise(resolve => {
            this.emit(step, { cmd });
            resolve(this.instance.exec(cmd));
        }).then(
            result => {
                this.stdouts.set(step, result.stdout);

                return result;
            },
            err => {
                this.stdouts.set(step, err.stdout);

                throw err;
            }
        );
    }
}

module.exports = Sequence;
