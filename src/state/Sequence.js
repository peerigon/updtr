export default class Sequence {
    constructor(instance, baseEvent) {
        this.instance = instance;
        this.baseEvent = baseEvent;
    }
    emit(eventName, event = {}) {
        this.instance.emit(eventName, {
            ...this.baseEvent,
            ...event,
        });
    }
    exec(step, cmd) {
        this.emit(step, { cmd });

        return this.instance.exec(cmd);
    }
}
