export function filterSuccessfulUpdates(results) {
    return results.filter(result => result.success === true);
}

export function filterFailedUpdates(results) {
    return results.filter(result => result.success === false);
}
