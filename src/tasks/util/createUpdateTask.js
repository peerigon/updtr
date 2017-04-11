export default function createUpdateTask(outdated, { nonBreaking }) {
    return {
        name: outdated.name,
        updateTo: nonBreaking === true ? outdated.wanted : outdated.latest,
        rollbackTo: outdated.current,
    };
}
