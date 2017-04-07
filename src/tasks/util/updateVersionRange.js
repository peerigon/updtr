import semver from "semver";

// Matches a semver version range that can be transformed to the new version in a safe manner
const matchPreservableRange = /^(~|>=|)\d+\.(\d+|x|\*)\.(\d+|x|\*)$/;
// Matches parts of an exact semver version (no range)
const matchExactVersion = /^(\d+)\.(\d+)\.(\d+)(-[^\s]+)?$/;
const matchNumber = /^\d+$/;

function assembleNewRange(oldMatch, newMatch) {
    const oldOperator = oldMatch[1];
    const oldMinor = oldMatch[2];
    const oldPatch = oldMatch[3];

    if (matchNumber.test(oldMinor) === false) {
        newMatch[2] = oldMinor;
        newMatch[3] = matchNumber.test(oldPatch) === true ? oldMinor : oldPatch;
    } else if (matchNumber.test(oldPatch) === false) {
        newMatch[3] = oldPatch;
    }

    return oldOperator + newMatch[1] + "." + newMatch[2] + "." + newMatch[3];
}

function tryVersionRangeUpdate(oldRange, newVersion) {
    const oldMatch = oldRange.match(matchPreservableRange);
    const newMatch = newVersion.match(matchExactVersion);

    if (oldMatch !== null && newMatch !== null) {
        const newVersionRange = assembleNewRange(oldMatch, newMatch);

        // All this is kind of error prone so let's do a sanity check if everything's ok
        if (semver.satisfies(newVersion, newVersionRange) === true) {
            return newVersionRange;
        }
    }

    return null;
}

function fallbackRange(newVersion) {
    return "^" + newVersion;
}

/**
 * Tries to apply the newMinVersion while maintaining the range (see https://github.com/peerigon/updtr/issues/47)
 * This is kind of risky because there are tons of semver possibilities. That's why this
 * function is very conservative in accepting semver ranges. If the range is not easily updatable,
 * we opt-out to npm's default caret operator.
 *
 * @param {string} oldRange
 * @param {string} newVersion
 * @returns {string}
 */
export default function updateVersionRange(oldRange, newVersion) {
    if (semver.validRange(oldRange) === null) {
        // Not very likely because other tools would have already complained about this but just to be sure
        return fallbackRange(newVersion);
    }

    if (matchExactVersion.test(oldRange) === true) {
        // The old version was pinned, so the new should also pinned
        return newVersion;
    }

    const newVersionRange = tryVersionRangeUpdate(oldRange, newVersion);

    return newVersionRange === null ?
        fallbackRange(newVersion) :
        newVersionRange;
}
