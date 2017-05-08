export default function pickEvents(eventName, emitArgs) {
    return emitArgs.filter(([name]) => name === eventName).map(args => args[1]);
}
