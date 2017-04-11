export default function rollbackTo(updateTask) {
    return {
        name: updateTask.name,
        version: updateTask.rollbackTo,
    };
}
