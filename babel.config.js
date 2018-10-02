/* eslint-disable import/unambiguous, strict */
"use strict";

module.exports = function (api) {
    api.cache(() => process.env.NODE_ENV);

    return {
        presets: [
            [
                "@babel/preset-env",
                {
                    targets: {
                        node: process.env.NODE_ENV === "production" ? 6 : "current",
                    },
                },
            ],
        ],
        plugins: ["@babel/transform-runtime"],
        sourceMaps: "inline",
        retainLines: true,
    };
};

