# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1]: 2024-01-24Z

### Changed

Due to using `util.inspect` instead of `JSON.stringify`, the output of the log
functions has changed:

- Log single quotes instead of double quotes in array and object values.
- No longer quotes property names in objects.
- Does not always include newlines in arrays and objects.

### Fixed

- Logging circular references no longer causes a crash.

## [0.1.0]: 2024-01-24Z

### Added

- `log.path` property to set the path to the log file.
- `log.info` function to log an info message.
- `log.warn` function to log a warning message.
- `log.error` function to log an error message.

[unreleased]: https://github.com/gimjb/log/compare/latest...HEAD
[0.1.0]: https://github.com/gimjb/log/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/gimjb/log/compare/v0.0.0...v0.1.0
