import semver from "semver";

// Matches a semver version range that can be transformed to the new version in a safe manner
const expectedSemverPattern = /^(\^|~|>=|)(\d+)\.(\d+|x|\*)\.(\d+|x|\*)(-[a-z][a-z\-.\d]+|)$/i;
const numberPattern = /^\d+$/;

function parse(semverString) {
    const match = semverString.match(expectedSemverPattern);

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

function isPinned({operator, major, minor, patch}) {
    return operator === "" &&
        [major, minor, patch].every(
            version => numberPattern.test(version) === true
        );
}

function tryVersionRangeUpdate(parsedOldRange, parsedNewVersion) {
    const {minor, patch, operator} = parsedOldRange;
    let newMinor = parsedNewVersion.minor;
    let newPatch = parsedNewVersion.patch;

    if (numberPattern.test(minor) === false) {
        newMinor = minor;
        newPatch = numberPattern.test(patch) === true ? minor : patch;
    } else if (numberPattern.test(patch) === false) {
        newPatch = patch;
    }

    return operator +
        parsedNewVersion.major +
        "." +
        newMinor +
        "." +
        newPatch +
        parsedNewVersion.release;
}

function isExpectedNewVersion(parsedNewVersion) {
    return parsedNewVersion !== null && parsedNewVersion.operator === "";
}

function fallbackRange(newVersion) {
    return "^" + newVersion;
}

/**
 * Tries to apply the newVersion while maintaining the range (see https://github.com/peerigon/updtr/issues/47)
 * This is kind of risky because there are tons of semver possibilities. That's why this
 * function is very conservative in accepting semver ranges. If the range is not easily updatable,
 * we opt-out to npm's default caret operator.
 *
 * @param {string} oldRange
 * @param {string} newVersion
 * @returns {string}
 */
export default function updateVersionRange(oldRange, newVersion) {
    const parsedOldRange = parse(oldRange.trim());

    if (parsedOldRange !== null) {
        if (isPinned(parsedOldRange) === true) {
            // The old version was pinned, so the new should also be pinned
            return newVersion;
        }

        const parsedNewVersion = parse(newVersion);

        if (isExpectedNewVersion(parsedNewVersion) === false) {
            return newVersion;
        }

        const newVersionRange = tryVersionRangeUpdate(
            parsedOldRange,
            parsedNewVersion
        );

        // All this is kind of error prone so let's do a sanity check if everything's ok
        if (semver.satisfies(newVersion, newVersionRange) === true) {
            return newVersionRange;
        }
    }

    return fallbackRange(newVersion);
}
