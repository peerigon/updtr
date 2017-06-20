import path from "path";
import fs from "../../../src/util/fs";

export const filterUpdtrTestModule = /^updtr-test-module-\d+/;

export default (async function (dir, filterPattern) {
    const pathToNodeModules = path.resolve(dir, "node_modules");
    const modules = await fs.readdir(pathToNodeModules);
    const errors = [];
    const versions = Object.create(null);

    await Promise.all(
        modules
            .filter(
            moduleName =>
                    filterPattern === undefined ?
                        true :
                        filterPattern.test(moduleName) === true
            )
            .map(async moduleName => {
                const pathToPackageJson = path.resolve(
                    pathToNodeModules,
                    moduleName,
                    "package.json"
                );

                try {
                    const packageJson = JSON.parse(
                        await fs.readFile(pathToPackageJson, "utf8")
                    );

                    versions[moduleName] = packageJson.version;
                } catch (error) {
                    errors.push({
                        error,
                        moduleName,
                    });
                }
            })
    );

    return {
        versions,
        errors,
    };
});
