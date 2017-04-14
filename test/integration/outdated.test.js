import {
    USE_YARN,
    UPDATE_TO_NON_BREAKING,
    SAVE_CARET,
    SAVE_EXACT,
} from "../../src/constants/config";
import exec from "../../src/exec/exec";
import {
    outdatedRegular as outdatedPackageContents,
} from "../fixtures/packageJsons";
import { create, run } from "../../src";
import getInstalledVersions, {
    filterUpdtrTestModule,
} from "./helpers/getInstalledVersions";
import { PACKAGE_JSON, YARN_LOCK } from "./helpers/constants";
import { createTempDir, read, write } from "./helpers/fs";

// These tests may take longer
jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

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
                expect(tempDirPackageContents).not.toBe(
                    outdatedPackageContents
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
                expect(tempDirPackageContents).not.toBe(
                    outdatedPackageContents
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
    describe("advanced configuration", () => {
        describe("npm", () => {
            test("should install all updates, update the package.json and return the results", async () => {
                const tempDir = await createTempDir();
                const registry = "http://registry.npmjs.org";
                const expectedTestStdout = "This is a custom test command";
                let installMissingCmd;
                let testStdout;

                await write(tempDir, PACKAGE_JSON, outdatedPackageContents);
                // This time, we install all dependencies
                await exec(
                    tempDir,
                    "npm i updtr-test-module-1@1.0.0 updtr-test-module-2@2.0.0"
                );

                const installedVersionsBefore = getInstalledVersions(
                    tempDir,
                    filterUpdtrTestModule
                );
                const updtr = create({
                    cwd: tempDir,
                    exclude: ["updtr-test-module-2"],
                    updateTo: UPDATE_TO_NON_BREAKING,
                    test: `echo "${ expectedTestStdout }" && exit 0`,
                    save: SAVE_EXACT,
                    registry,
                });

                updtr.on("init/install-missing", ({ cmd }) => {
                    installMissingCmd = cmd;
                });
                updtr.on("sequential-update/test-result", ({ stdout }) => {
                    // echo adds an EOL
                    testStdout = stdout.trim();
                });

                const results = await run(updtr);
                const [
                    tempDirPackageContents,
                    installedVersionsAfter,
                ] = await Promise.all([
                    read(tempDir, PACKAGE_JSON),
                    getInstalledVersions(tempDir, filterUpdtrTestModule),
                ]);

                expect(installMissingCmd).toContain(registry);
                expect(testStdout).toBe(expectedTestStdout);
                expect(results).toMatchSnapshot(
                    "advanced configuration > npm > results"
                );
                expect(tempDirPackageContents).not.toBe(
                    outdatedPackageContents
                );
                expect(
                    JSON.parse(tempDirPackageContents).dependencies
                ).toMatchSnapshot(
                    "advanced configuration > npm > package.json dependencies"
                );
                expect(installedVersionsAfter).not.toEqual(
                    installedVersionsBefore
                );
                expect(installedVersionsAfter.versions).toMatchSnapshot(
                    "advanced configuration > npm > installed versions"
                );
            });
        });
        describe("yarn", () => {
            test("should install all updates, update the package.json and return the results", async () => {
                // yarn does not support custom registries yet, thus it's commented out here.
                const tempDir = await createTempDir();
                // const registry = "http://registry.npmjs.org";
                const expectedTestStdout = "This is a custom test command";
                // let installMissingCmd;
                let testStdout;

                await write(tempDir, PACKAGE_JSON, outdatedPackageContents);
                // This time, we install all dependencies
                await exec(
                    tempDir,
                    "yarn add updtr-test-module-1@1.0.0 updtr-test-module-2@2.0.0"
                );

                const yarnLockContentsBefore = await read(tempDir, YARN_LOCK);
                const installedVersionsBefore = getInstalledVersions(
                    tempDir,
                    filterUpdtrTestModule
                );
                const updtr = create({
                    cwd: tempDir,
                    use: USE_YARN,
                    exclude: ["updtr-test-module-2"],
                    updateTo: UPDATE_TO_NON_BREAKING,
                    test: `echo "${ expectedTestStdout }" && exit 0`,
                    save: SAVE_CARET,
                    // registry,
                });

                // updtr.on("init/install-missing", ({ cmd }) => {
                //     installMissingCmd = cmd;
                // });
                updtr.on("sequential-update/test-result", ({ stdout }) => {
                    // echo adds an EOL
                    testStdout = stdout.trim();
                });

                const results = await run(updtr);
                const [
                    tempDirPackageContents,
                    installedVersionsAfter,
                    yarnLockContentsAfter,
                ] = await Promise.all([
                    read(tempDir, PACKAGE_JSON),
                    getInstalledVersions(tempDir, filterUpdtrTestModule),
                    read(tempDir, YARN_LOCK),
                ]);

                // expect(installMissingCmd).toContain(registry);
                expect(testStdout).toBe(expectedTestStdout);
                expect(results).toMatchSnapshot(
                    "advanced configuration > yarn > results"
                );
                expect(tempDirPackageContents).not.toBe(
                    outdatedPackageContents
                );
                expect(
                    JSON.parse(tempDirPackageContents).dependencies
                ).toMatchSnapshot(
                    "advanced configuration > yarn > package.json dependencies"
                );
                expect(installedVersionsAfter).not.toEqual(
                    installedVersionsBefore
                );
                expect(installedVersionsAfter.versions).toMatchSnapshot(
                    "advanced configuration > yarn > installed versions"
                );
                expect(yarnLockContentsBefore).not.toBe(yarnLockContentsAfter);
                expect(yarnLockContentsAfter).toMatch(
                    /updtr-test-module-1@\^1\.0\.0:\s*version "1\.1\.1"/
                );
                expect(yarnLockContentsAfter).toMatch(
                    /updtr-test-module-2@2\.0\.0:\s*version "2\.0\.0"/
                );
            });
        });
    });
});
