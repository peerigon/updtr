# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="2.0.0"></a>
# [2.0.0](https://github.com/peerigon/updtr/compare/v1.0.0...v2.0.0) (2017-06-20)


### Features

* Rewrite ([7ffc10a](https://github.com/peerigon/updtr/commit/7ffc10a)), closes [#14](https://github.com/peerigon/updtr/issues/14) [#47](https://github.com/peerigon/updtr/issues/47) [#46](https://github.com/peerigon/updtr/issues/46) [#13](https://github.com/peerigon/updtr/issues/13) [#51](https://github.com/peerigon/updtr/issues/51) [#58](https://github.com/peerigon/updtr/issues/58)


### BREAKING CHANGES

* New and changed CLI options

``` 
  --use, -u             Specify the package manager to use  [choices: "npm", "yarn"] [default: "npm"]
  --exclude, --ex       Space separated list of module names that should not be updated  [array]
  --update-to, --to     Specify which updates you want to install  [choices: "latest", "non-breaking", "wanted"] [default: "latest"]
  --save, -s            Specify how updated versions should be saved to the package.json  [choices: "smart", "caret", "exact"] [default: "smart"]
  --reporter, -r        Choose a reporter for the console output  [choices: "dense", "none"] [default: "dense"]
  --test, -t            Specify a custom test command. Surround with quotes.
  --test-stdout, --out  Show test stdout if the update fails  [boolean]
  --registry, --reg     Specify a custom registry to use
  --version             Show version number  [boolean]
  --help                Show help  [boolean]
```



<a name="1.0.0"></a>
# [1.0.0](https://github.com/peerigon/updtr/compare/v0.2.1...v1.0.0) (2017-04-01)


### Bug Fixes

* **npm:** ignore error status 1 on npm outdated ([ec4057c](https://github.com/peerigon/updtr/commit/ec4057c))


### Features

* Use yarn package manager when available ([bcca7ce](https://github.com/peerigon/updtr/commit/bcca7ce))
