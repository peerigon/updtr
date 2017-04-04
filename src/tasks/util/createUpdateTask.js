export default function createUpdateTask(outdated, { updateTo }) {
    return {
        name: outdated.name,
        type: outdated.type,
        updateTo: outdated[updateTo],
        rollbackTo: outdated.current,
    };
}
