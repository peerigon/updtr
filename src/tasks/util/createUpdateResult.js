export default function createUpdateResult(updateTask, success) {
    return {
        name: updateTask.name,
        updateTo: updateTask.updateTo,
        rollbackTo: updateTask.rollbackTo,
        success,
    };
}
