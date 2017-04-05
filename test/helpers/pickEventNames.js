export default function pickEventNames(eventNames, events) {
    return events
        .filter(([eventName]) => eventNames.indexOf(eventName) > -1)
        .map(([eventName]) => eventName);
}
