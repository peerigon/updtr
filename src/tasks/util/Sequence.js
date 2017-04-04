export default class Sequence {
    constructor(name, instance, baseEvent) {
        this.name = name;
        this.instance = instance;
        this.baseEvent = baseEvent;
    }
    emit(eventName, event = {}) {
        this.instance.emit(this.name + "/" + eventName, {
            ...this.baseEvent,
            ...event,
        });
    }
    exec(step, cmd) {
        this.emit(step, { cmd });

        return this.instance.exec(cmd);
    }
}
