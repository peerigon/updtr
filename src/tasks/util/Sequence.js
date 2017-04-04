export default class Sequence {
    constructor(name, updtr, baseEvent) {
        this.name = name;
        this.updtr = updtr;
        this.baseEvent = baseEvent;
    }
    emit(eventName, event = {}) {
        this.updtr.emit(this.name + "/" + eventName, {
            ...this.baseEvent,
            ...event,
        });
    }
    exec(step, cmd) {
        this.emit(step, { cmd });

        return this.updtr.exec(cmd);
    }
}
