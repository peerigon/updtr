![updtr](assets/updtr.jpg)

# updtr

**Update outdated npm modules with zero pain™**

[![Build Status](https://travis-ci.org/peerigon/updtr.svg?branch=master)](https://travis-ci.org/peerigon/updtr)
[![](https://img.shields.io/npm/v/updtr.svg)](https://www.npmjs.com/package/updtr)
[![](https://img.shields.io/npm/dm/updtr.svg)](https://www.npmjs.com/package/updtr)
[![Coverage Status](https://coveralls.io/repos/peerigon/updtr/badge.svg?branch=master&service=github)](https://coveralls.io/github/peerigon/updtr?branch=master)

Based on `npm outdated`, **updtr** installs the latest version and runs `npm test` for each dependency. If the test succeeds, **updtr** saves the new version number to your `package.json`. If the test fails, however, **updtr** rolls back its changes.

![updtr](assets/updtr.gif)

## Installation

```
npm install -g updtr
```

## Options

```
➜  ~  updtr --help

  Usage: updtr [options]

  Update outdated npm modules with zero pain™

  Options:

    -h, --help                 output usage information
    -V, --version              output the version number
    -R, --reporter <reporter>  choose reporter: default, shy
    -w, --wanted               updates to wanted version specified in package.json instead of the modules latest version
    -t, --test <test>          change the command for the tests
    -e, --exclude <exclude>    exclude modules comma seperated, e.g. updtr --exclude module1,module2
    --test-stdout              shows stdout if your test command fails
    --save-exact               save exact module version
    --registry                 change registry
```

## License

Unlicense
