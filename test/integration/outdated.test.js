import { USE_YARN } from "../../src/constants/config";
import {
    outdatedRegular as outdatedPackageContents,
} from "../fixtures/packageJsons";
import { create, run } from "../../src";
import getInstalledVersions, {
    filterUpdtrTestModule,
} from "./helpers/getInstalledVersions";
import { PACKAGE_JSON, YARN_LOCK } from "./helpers/constants";
import { createTempDir, read, write } from "./helpers/fs";

describe("integration test: when there are outdated dependencies", () => {
    describe("default configuration", () => {
        describe("npm", () => {
            test("should install all updates, update the package.json and return the results", async () => {
                const tempDir = await createTempDir();

                await write(tempDir, PACKAGE_JSON, outdatedPackageContents);

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

                expect(results).toMatchSnapshot(
                    "default configuration > npm > results"
                );
                expect(
                    JSON.parse(tempDirPackageContents).dependencies
                ).toMatchSnapshot(
                    "default configuration > npm > package.json dependencies"
                );
                expect(installedVersions.versions).toMatchSnapshot(
                    "default configuration > npm > installed versions"
                );
            });
        });
        describe("yarn", () => {
            test("should install all updates, update the package.json and return the results", async () => {
                const tempDir = await createTempDir();

                await write(tempDir, PACKAGE_JSON, outdatedPackageContents);

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

                expect(results).toMatchSnapshot(
                    "default configuration > yarn > results"
                );
                expect(
                    JSON.parse(tempDirPackageContents).dependencies
                ).toMatchSnapshot(
                    "default configuration > yarn > package.json dependencies"
                );
                expect(installedVersions.versions).toMatchSnapshot(
                    "default configuration > yarn > installed versions"
                );
                expect(tempDirYarnLockContents).toMatch(
                    /updtr-test-module-1@2\.0\.0:\s*version "2\.0\.0"/
                );
                expect(tempDirYarnLockContents).toMatch(
                    // This module still has its caret because the latest version is
                    // already installed during the init task
                    /updtr-test-module-2@\^2\.0\.0:\s*version "2\.1\.1"/
                );
            });
        });
    });
});
