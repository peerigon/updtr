export default class Sequence {
    constructor(instance, baseEvent) {
        this.instance = instance;
        this.baseEvent = baseEvent;
        this.stdouts = new Map();
    }
    emit(eventName, event = {}) {
        this.instance.emit(eventName, {
            ...this.baseEvent,
            ...event,
        });
    }
    async exec(step, cmd) {
        let resultOrError;

        this.emit(step, { cmd });

        try {
            resultOrError = await this.instance.exec(cmd);

            return resultOrError;
        } catch (err) {
            resultOrError = err;

            throw err;
        } finally {
            this.stdouts.set(step, resultOrError.stdout);
        }
    }
}
