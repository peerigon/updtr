export default class Sequence {
    constructor(name, updtr, baseEvent) {
        this.name = name;
        this.updtr = updtr;
        this.baseEvent = baseEvent;
        this.isRunning = false;
    }
    start() {
        this.isRunning = true;
        this.emit("start");
    }
    emit(eventName, event = {}) {
        const fullEventName = this.name + "/" + eventName;

        if (this.isRunning === false) {
            throw new Error(
                `Cannot emit event ${ fullEventName }: sequence is not running`
            );
        }
        this.updtr.emit(fullEventName, {
            ...this.baseEvent,
            ...event,
        });
    }
    exec(step, cmd) {
        this.emit(step, { cmd });

        return this.updtr.exec(cmd);
    }
    end(result) {
        this.emit("end", result);
        this.isRunning = false;
    }
}
