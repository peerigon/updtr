import {USE_YARN} from "../../src/constants/config";
import {
    noOutdatedRegular as noOutdatedPackageContents,
} from "../fixtures/packageJsons";
import {create, run} from "../../src";
import getInstalledVersions, {
    filterUpdtrTestModule,
} from "./helpers/getInstalledVersions";
import {
    PACKAGE_JSON,
    YARN_LOCK,
    FIXTURE_NO_OUTDATED,
} from "./helpers/constants";
import {createTempDir, read, write} from "./helpers/fs";

// These tests may take longer on travis
jasmine.DEFAULT_TIMEOUT_INTERVAL = 10 * 60 * 1000;

describe("integration test: when there are no outdated dependencies", () => {
    describe("npm", () => {
        it("should not change the package.json, change the installed dependencies and resolve with an empty array as results", async () => {
            const tempDir = await createTempDir();

            await write(tempDir, PACKAGE_JSON, noOutdatedPackageContents);

            const updtr = create({
                cwd: tempDir,
            });
            const results = await run(updtr);
            const [
                tempDirPackageContents,
                installedVersions,
            ] = await Promise.all([
                read(tempDir, PACKAGE_JSON),
                getInstalledVersions(tempDir, filterUpdtrTestModule),
            ]);

            expect(results).toEqual([]);
            expect(tempDirPackageContents).toBe(noOutdatedPackageContents);
            expect(installedVersions.versions).toMatchSnapshot(
                "npm > installed versions"
            );
        });
    });
    describe("yarn", () => {
        it("should not change the package.json and yarn.lock and resolve with an empty array as results", async () => {
            const [tempDir, yarnLockContents] = await Promise.all([
                createTempDir(),
                read(FIXTURE_NO_OUTDATED, YARN_LOCK),
            ]);

            await write(tempDir, PACKAGE_JSON, noOutdatedPackageContents);

            const updtr = create({
                cwd: tempDir,
                use: USE_YARN,
            });
            const results = await run(updtr);
            const [
                tempDirPackageContents,
                installedVersions,
                tempDirYarnLockContents,
            ] = await Promise.all([
                read(tempDir, PACKAGE_JSON),
                getInstalledVersions(tempDir, filterUpdtrTestModule),
                read(tempDir, YARN_LOCK),
            ]);

            expect(results).toEqual([]);
            expect(tempDirPackageContents).toBe(noOutdatedPackageContents);
            expect(installedVersions.versions).toMatchSnapshot(
                "npm > installed versions"
            );
            expect(tempDirYarnLockContents).toBe(yarnLockContents);
        });
    });
});
