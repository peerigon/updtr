import readFixtures from "../helpers/readFixtures";

export let noOutdatedRegular;
export let outdatedRegular;
export let outdatedDev;

beforeAll(async () => {
    const packageJsons = await readFixtures([
        "no-outdated/package.json",
        // Currently not used anywhere
        // "no-outdated-dev/package.json",
        "outdated/package.json",
        "outdated-dev/package.json",
    ]);

    noOutdatedRegular = packageJsons.get("no-outdated/package.json");
    outdatedRegular = packageJsons.get("outdated/package.json");
    outdatedDev = packageJsons.get("outdated-dev/package.json");
});
