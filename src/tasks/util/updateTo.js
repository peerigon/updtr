export default function updateTo(updateTask) {
    return {
        name: updateTask.name,
        version: updateTask.updateTo,
    };
}
