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
                        node: 6,
                    },
                },
            ],
        ],
        plugins: [
            "@babel/plugin-transform-runtime",
        ],
        sourceMaps: "inline",
        retainLines: true,
    };
};

