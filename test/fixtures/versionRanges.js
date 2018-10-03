// Copied from https://github.com/npm/node-semver
const versionRanges = [
    "~0.6.1-1",
    "1.0.0 - 2.0.0",
    "1.0.0-2.0.0",
    "1.0.0",
    "   1.0.0   ",
    "1.0.0-beta.1",
    ">=1.0.0-beta.1",
    "1.0.0-BETA.1",
    "1.0.0-alpha-1",
    "1.0.0 alpha", // Nonsense value
    "~1.0.0",
    "   ~1.0.0   ",
    "~1.0.x",
    ">=*",
    "",
    "*",
    ">=1.0.0",
    "   >=1.0.0   ",
    ">1.0.0",
    "   >1.0.0    ",
    "<=2.0.0",
    "<2.0.0",
    ">=   1.0.0",
    "> 1.0.0",
    "<=   2.0.0",
    "<    2.0.0",
    "<\t2.0.0",
    ">=0.1.97",
    "0.1.20 || 1.2.4",
    ">=0.2.3 || <0.0.1",
    "||",
    "2.x.x",
    "1.2.x",
    "1.2.x || 2.x",
    "x",
    "2.*.*",
    "1.2.*",
    "1.2.* || 2.*",
    "2",
    "2.3",
    "~2.4",
    "~>3.2.1",
    "~1",
    "~>1",
    "~> 1",
    "~1.0",
    "~ 1.0",
    ">=1",
    ">= 1",
    "<1.2",
    "< 1.2",
    "1",
    "~v0.5.4-pre",
    "~v0.5.4-pre",
    "=0.7.x",
    ">=0.7.x",
    ">=0.7.X",
    "=0.7.x",
    ">=0.7.x",
    "<=0.7.x",
    ">0.2.3 >0.2.4 <=0.2.5",
    ">=0.2.3 <=0.2.4",
    "1.0.0 - 2.0.0",
    "^1",
    "^3.0.0",
    "^1.0.0 || ~2.0.1",
    "^0.1.0 || ~3.0.1 || 5.0.0",
    "^0.1.0 || ~3.0.1 || >4 <=5.0.0",
    // Nonsense values
    "*.1.2",
    "x.1.2",
    "1.x.2",
    "1.*.2",
];

export default versionRanges;
