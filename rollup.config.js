import path from "path";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";

export default {
    entry: "src/bin/index.js",
    format: "cjs",
    plugins: [
        resolve({
            jail: path.resolve(__dirname, "src"),
        }),
        babel({
            runtimeHelpers: true,
            exclude: "node_modules/**", // only transpile our source code
        }),
    ],
    dest: "dist/index.js",
    sourceMap: true,
};
