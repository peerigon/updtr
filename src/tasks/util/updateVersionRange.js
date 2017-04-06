import semver from "semver";

// Matches a semver version range that can be transformed to the new version
const matchPreservableRange = /^(~|>=|)\d+\.(\d+|x|\*)\.(\d+|x|\*)$/;
// Matches parts of an exact semver version (no range)
const matchExactVersion = /^(\d+)\.(\d+)\.(\d+)(-[^\s]+)?$/;
const matchNumber = /^\d+$/;

/**
 * Tries to apply the newMinVersion while maintaining the range (see https://github.com/peerigon/updtr/issues/47)
 * This is kind of risky because there are tons of semver possibilities. That's why this
 * function is very conservative in accepting semver ranges. If the range is not easily updatable,
 * we opt-out to npm's default caret operator.
 *
 * @param {string} oldRange
 * @param {string} newMinVersion
 * @returns {string}
 */
export default function updateVersionRange(oldRange, newMinVersion) {
    if (semver.validRange(oldRange) === null) {
        // Very rare, but just to be sure
        return "^" + newMinVersion;
    }

    if (matchExactVersion.test(oldRange) === true) {
        // The old version was pinned, so the new should also pinned
        return newMinVersion;
    }

    const oldMatch = oldRange.match(matchPreservableRange);
    const newMatch = newMinVersion.match(matchExactVersion);

    if (oldMatch !== null && newMatch !== null) {
        const oldOperator = oldMatch[1];
        const oldMinor = oldMatch[2];
        const oldPatch = oldMatch[3];

        if (matchNumber.test(oldMinor) === false) {
            newMatch[2] = oldMinor;
            newMatch[3] = matchNumber.test(oldPatch) === true ?
                oldMinor :
                oldPatch;
        } else if (matchNumber.test(oldPatch) === false) {
            newMatch[3] = oldPatch;
        }

        const newVersionRange = oldOperator +
            newMatch[1] +
            "." +
            newMatch[2] +
            "." +
            newMatch[3];

        // This is kind of error prone so let's do a sanity check if everything's ok
        if (
            semver.validRange(newVersionRange) !== null &&
            semver.satisfies(newMinVersion, newVersionRange) === true
        ) {
            return newVersionRange;
        }
    }

    return "^" + newMinVersion;
}
