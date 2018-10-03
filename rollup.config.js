import path from "path";
import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";

const rollupConfig = {
    input: "src/bin/index.js",
    plugins: [
        resolve({
            jail: path.resolve(__dirname, "src"),
        }),
        babel({
            runtimeHelpers: true,
            exclude: "node_modules/**", // only transpile our source code
        }),
    ],
    output: {
        file: "dist/index.js",
        sourceMap: true,
        format: "cjs",
    },
};

export default rollupConfig;
