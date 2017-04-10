export default function pickEventNames(eventNames, emitArgs) {
    return emitArgs
        .filter(([eventName]) => eventNames.indexOf(eventName) > -1)
        .map(([eventName]) => eventName);
}
