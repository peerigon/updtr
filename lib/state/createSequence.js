"use strict";

function createSequence(instance, baseEvent) {
    const stdouts = {};

    function emit(eventName, event) {
        instance.emit(eventName, Object.assign(event || {}, baseEvent));
    }

    function saveStepStdout(step, stdout) {
        stdouts[step] = stdout;
    }

    return {
        stdouts,
        emit,
        exec: (step, cmd) =>
            Promise.resolve().then(() => {
                emit(step, {
                    cmd,
                });

                return instance.exec(cmd).then(
                    result => {
                        saveStepStdout(step, result.stdout);

                        return result;
                    },
                    err => {
                        saveStepStdout(step, err.stdout);

                        throw err;
                    }
                );
            }),
    };
}

module.exports = createSequence;
