export default function createUpdateTask(outdated, { updateTo }) {
    return {
        name: outdated.name,
        updateTo: outdated[updateTo],
        rollbackTo: outdated.current,
    };
}
