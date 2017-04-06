import semverUtils from "semver-utils";
import semver from "semver";

const matchPreservableRange = /^(~|>=|)\d+\.(\d+|x)\.(\d+|x)$/;
const matchExactVersion = /^(\d+)\.(\d+)\.(\d+)$/;
const matchNumber = /^\d+$/;

export default function updateVersionRange(oldRange, newMinVersion) {
    if (semver.validRange(oldRange) === null) {
        return "^" + newMinVersion;
    }

    if (matchExactVersion.test(oldRange)) {
        return newMinVersion;
    }

    const oldMatch = oldRange.match(matchPreservableRange);
    const newMatch = newMinVersion.match(matchExactVersion);

    if (oldMatch && newMatch) {
        const oldOperator = oldMatch[1];
        const oldMinor = oldMatch[2];
        const oldPatch = oldMatch[3];

        if (matchNumber.test(oldMinor) === false) {
            newMatch[2] = oldMinor;
            if (matchNumber.test(oldPatch) === false) {
                newMatch[3] = oldPatch;
            }
        } else if (matchNumber.test(oldPatch) === false) {
            newMatch[3] = oldPatch;
        }

        return oldOperator +
            newMatch[1] +
            "." +
            newMatch[2] +
            "." +
            newMatch[3];
    }

    return "^" + newMinVersion;
}
