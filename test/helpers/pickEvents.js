export default function pickEvents(eventName, emitArgs) {
    return emitArgs
        .filter(([eName]) => eName === eventName)
        .map(args => args[1]);
}
