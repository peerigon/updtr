# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.1.0](https://github.com/peerigon/updtr/compare/v4.0.0...v4.1.0) (2024-07-03)


### Features

* Introduce interactive update ([d3975e2](https://github.com/peerigon/updtr/commit/d3975e27787fac1199ef751cb947f3675ccec70c))

## [4.0.0](https://github.com/peerigon/updtr/compare/v3.1.0...v4.0.0) (2021-08-20)


### ⚠ BREAKING CHANGES

* No longer supporting node versions 6-11

### Features

* update dependencies and remove vulnerabilities ([#86](https://github.com/peerigon/updtr/issues/86)) ([eb7a1ef](https://github.com/peerigon/updtr/commit/eb7a1ef4281714405c64ef633ac2963b87510887))


* upgrade node version to v12 ([2e29ef0](https://github.com/peerigon/updtr/commit/2e29ef0c605a7889ca5c50c7da86e65444c0acec))

<a name="3.1.0"></a>
# [3.1.0](https://github.com/peerigon/updtr/compare/v3.0.0...v3.1.0) (2018-10-04)


### Features

* Add basic reporter ([#78](https://github.com/peerigon/updtr/issues/78)) ([59885d3](https://github.com/peerigon/updtr/commit/59885d3))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/peerigon/updtr/compare/v2.0.0...v3.0.0) (2018-10-03)


### Bug Fixes

* Respect package.json indentation ([#77](https://github.com/peerigon/updtr/issues/77)) ([e766fb0](https://github.com/peerigon/updtr/commit/e766fb0)), closes [#68](https://github.com/peerigon/updtr/issues/68)


### Fix

* Stdout output parsing from yarn ([ff56fbb](https://github.com/peerigon/updtr/commit/ff56fbb))


### BREAKING CHANGES

* Removed official Node 4 support. It may still work, but now you're on your own.



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
