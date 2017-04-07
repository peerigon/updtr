import semver from "semver";

// Matches a semver version range that can be transformed to the new version in a safe manner
// The caret operator is omitted here because it's our fallbackRange anyway
const updateableRangePattern = /^(~|>=|)(\d+)\.(\d+|x|\*)\.(\d+|x|\*)(-[a-z][a-z\-.\d]+|)$/i;
// Matches parts of an exact semver version (no range)
const exactVersionPattern = /^(\d+)\.(\d+)\.(\d+)(-[a-z][a-z\-.\d]+|)$/i;
const numberPattern = /^\d+$/;

function parseUpdateableRange(range) {
    const match = range.match(updateableRangePattern);

    return match === null ?
        null :
    {
        operator: match[1],
        major: match[2],
        minor: match[3],
        patch: match[4],
        release: match[5],
    };
}

function parseExactVersion(version) {
    const match = version.match(exactVersionPattern);

    return match === null ?
        null :
    {
        major: match[1],
        minor: match[2],
        patch: match[3],
        release: match[4],
    };
}

function assembleNewRange(parsedOldRange, parsedNewVersion) {
    const { minor, patch, operator } = parsedOldRange;
    let newMinor = parsedNewVersion.minor;
    let newPatch = parsedNewVersion.patch;

    if (numberPattern.test(minor) === false) {
        newMinor = minor;
        newPatch = numberPattern.test(patch) === true ? minor : patch;
    } else if (numberPattern.test(patch) === false) {
        newPatch = patch;
    }

    return operator + parsedNewVersion.major + "." + newMinor + "." + newPatch;
}

function tryVersionRangeUpdate(oldRange, newVersion) {
    const parsedOldRange = parseUpdateableRange(oldRange);
    const parsedNewVersion = parseExactVersion(newVersion);

    if (parsedOldRange !== null && parsedNewVersion !== null) {
        const newVersionRange = assembleNewRange(
            parsedOldRange,
            parsedNewVersion
        );

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
    const oldRangeTrimmed = oldRange.trim();

    if (semver.validRange(oldRangeTrimmed) === null) {
        // Filter unusual ranges. There is no way to transform them in a safer manner.
        return fallbackRange(newVersion);
    }

    if (exactVersionPattern.test(oldRangeTrimmed) === true) {
        // The old version was pinned, so the new should also pinned
        return newVersion;
    }

    const newVersionRange = tryVersionRangeUpdate(oldRangeTrimmed, newVersion);

    return newVersionRange === null ?
        fallbackRange(newVersion) :
        newVersionRange;
}
