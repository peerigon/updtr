export default function createUpdateResult(updateTask, success) {
    return {
        name: updateTask.name,
        current: success ? updateTask.updateTo : updateTask.rollbackTo,
        success,
    };
}
