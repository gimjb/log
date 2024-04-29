# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.1]: 2024-04-29Z

### Fixed

- Fix crash when `log.config.mode` is set to `LogMode.Json` and the log file
  does not exist.
- Use correct hyphen in `log.config.path` default value (`-` instead of `–`).

## [0.2.0]: 2024-04-29Z

### Added

- `log.config` property to set the configuration.
  - A default configuration for `log.config.path` ([#3]): a function that returns
    a path in the format `<project root>/logs/log-<YYYY-MM-DD>.<file extension>`.
  - `log.config.mode` ([#5]) to set the mode or format of the log methods:
    - `log.config.mode = LogMode.ReturnOnly` to return the log data without
      logging it to a file.
    - `log.config.mode = LogMode.Json` (default) to log the data to a file in
      JSON format.
    - `log.config.mode = LogMode.PlainText` to log the data to a file in plain
      text format.
    - `log.config.mode = LogMode.Yaml` to log the data to a file in YAML format.
  - `includeStack` ([#4]) option to include the stack trace in the log data.
    Default: `true`.

### Changed

- [BREAKING] `log.path` has been moved to `log.config.path`
- The type of `log.config.path` has been changed to `string | (() => string)`.
- [BREAKING] `log.info`, `log.warn`, and `log.error` now return `LogValues`
  instead of a `string`:
  ```ts
  interface LogValues {
    type: LogType
    message: string
    timestamp: string
    stack?: string[]
  }
  ```

### Removed

- No longer logs to the console.

[#3]: https://github.com/gimjb/log/issues/3
[#4]: https://github.com/gimjb/log/issues/4
[#5]: https://github.com/gimjb/log/issues/5

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
[0.2.1]: https://github.com/gimjb/log/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/gimjb/log/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/gimjb/log/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/gimjb/log/compare/v0.0.0...v0.1.0
