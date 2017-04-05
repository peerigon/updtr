export default function createUpdateResult(updateTask, success) {
    return {
        name: updateTask.name,
        version: success ? updateTask.updateTo : updateTask.rollbackTo,
        success,
    };
}
