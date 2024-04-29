import fsPromises from 'fs/promises'
import fsSync from 'fs'
import { inspect } from 'util'
import path from 'path'

/**
  * Get the path to the top-level directory of the application.
  *
  * @returns The path to the top-most directory containing a `package.json` file.
  */
function getAppRoot (): string {
  const paths = module.paths
  paths.reverse()

  for (const p of paths) {
    const packagePath = path.join(p, '..', 'package.json')
    try {
      fsSync.accessSync(packagePath)
      return path.dirname(packagePath)
    } catch (err) {
      continue
    }
  }

  throw new Error('Could not find the root directory of the application.')
}

/** The mode to log in. */
export enum LogMode {
  /**
   * Only return the logger values; this is useful if you want to log the values
   * yourself, e.g. to a database.
   */
  ReturnOnly = 'return-only',
  /** Log the values to a file in JSON format. */
  Json = 'json',
  /** Log the values to a file in plain text format. */
  PlainText = 'plain-text',
  /** Log the values to a file in YAML format. */
  Yaml = 'yml'
}

/** Configuration for the logger. */
export interface Config {
  /** The path to the log file. */
  path: string | (() => string)
  /** The mode to log in. */
  mode: LogMode
  /** Whether to include the file and line number in the log message. */
  includeStack: boolean
}

const appRoot = getAppRoot()
const config: Config = {
  mode: LogMode.Json,
  includeStack: true,
  path: () => {
    const dateString = new Date().toISOString().slice(0, 10)

    let ext: string
    switch (config.mode) {
      case LogMode.Json:
        ext = 'json'
        break
      case LogMode.PlainText:
        ext = 'txt'
        break
      case LogMode.Yaml:
        ext = 'yml'
        break
      default:
        throw new Error(`Cannot determine log file extension from mode '${config.mode}'.`)
    }

    return path.join(appRoot, `logs/log–${dateString}.${ext}`)
  }
}

/** The type of log message. */
enum LogType {
  /** An informational message. */
  Info = 'info',
  /** A warning message. */
  Warn = 'warn',
  /** An error message. */
  Error = 'error'
}

export interface LogValues {
  type: LogType
  message: string
  timestamp: string
  stack?: string[]
}

/**
  * Get the values to use in the log functions.
  *
  * @param message The message to log.
  * @param type The type of log message.
  * @returns The values to use in the log functions.
  */
function getLogValues (message: unknown, type: LogType): LogValues {
  const output: LogValues = {
    type,
    message: '',
    timestamp: new Date().toISOString()
  }

  switch (typeof message) {
    case 'string':
      output.message = message
      break
    case 'object':
      output.message = inspect(message)
      break
    case 'undefined':
      output.message = 'undefined'
      break
    default:
      output.message = String(message)
      break
  }

  if (config.includeStack) {
    const stack = new Error().stack?.split('\n')

    if (typeof stack === 'object') {
      output.stack = stack.slice(4)
    }
  }

  return output
}

/**
 * Log the values to a file in JSON format.
 *
 * @param logValues The values to log.
 * @param logPath The path to the log file.
 * @param dry Whether to actually log the message or only return the output.
 * @returns A promise that resolves when the values have been logged to the file.
 */
async function logJson (logValues: LogValues, logPath: string, dry: boolean): Promise<string> {
  const output = '  ' + JSON.stringify(logValues, null, 2).replace(/\n/g, '\n  ')

  if (!dry) {
    const content = await fsPromises.readFile(logPath, { encoding: 'utf-8' })

    if (content === '') {
      await fsPromises.writeFile(logPath, `[\n${output}\n]\n`)
    } else {
      await fsPromises.writeFile(logPath, content.replace(/\s*]\s*$/, ',\n') + output + '\n]')
    }
  }

  return output
}

/**
 * Log the values to a file in YAML format.
 *
 * @param logValues The values to log.
 * @param logPath The path to the log file.
 * @param dry Whether to actually log the message or only return the output.
 * @returns A promise that resolves when the values have been logged to the file.
 */
async function logYaml (logValues: LogValues, logPath: string, dry: boolean): Promise<string> {
  let output =
    `- type: ${logValues.type}\n` +
    `  message: '${logValues.message.replaceAll("'", "\\'").replaceAll('\n', '\\n')}'\n` +
    `  timestamp: '${logValues.timestamp}'\n`

  if (typeof logValues.stack === 'object') {
    output += '  stack:\n'
    for (const line of logValues.stack) {
      output += `    - '${line}'\n`
    }
  }

  if (!dry) {
    await fsPromises.appendFile(logPath, output)
  }

  return output
}

export const padding = ' '.repeat('yyyy-mm-ddThh:mm:ss.mmmZ (ERROR): '.length)
/**
 * Log the values to a file in plain text format.
 *
 * @param logValues The values to log.
 * @param logPath The path to the log file.
 * @param dry Whether to actually log the message or only return the output.
 * @returns A promise that resolves when the values have been logged to the file.
 */
async function logPlainText (logValues: LogValues, logPath: string, dry: boolean): Promise<string> {
  let output =
    `${logValues.timestamp} (${logValues.type.toUpperCase()}): `.padEnd(padding.length) +
    logValues.message.replaceAll('\n', `\n${padding}`) +
    '\n'

  if (typeof logValues.stack === 'object') {
    for (const line of logValues.stack) {
      output += `${line}\n`
    }
  }

  output += '\n'

  if (!dry) {
    await fsPromises.appendFile(logPath, output)
  }

  return output
}

/**
 * Log a message to the console and to a text file.
 * @param message The message to log.
 * @param type The type of log message.
 * @param dry Whether to actually log the message or only return the output.
 * @returns A promise that resolves when the message has been logged to the
 * console and to a file.
 */
async function log (message: unknown, type: LogType, dry = false): Promise<LogValues | string> {
  const logValues = getLogValues(message, type)

  if (config.mode === LogMode.ReturnOnly) {
    return logValues
  }

  let logPath = typeof config.path === 'function' ? config.path() : config.path

  if (!logPath.startsWith('/')) {
    logPath = path.join(appRoot, logPath)
  }

  switch (config.mode) {
    case LogMode.Json:
      return await logJson(logValues, logPath, dry)
    case LogMode.Yaml:
      return await logYaml(logValues, logPath, dry)
    case LogMode.PlainText:
      return await logPlainText(logValues, logPath, dry)
  }
}

/** A logger for the application. */
export default {
  /** Configuration for the logger. */
  config,
  /**
   * Log an info message.
   * @param message The message to log.
   * @param dry Whether to actually log the message or only return the output.
   * @returns A promise that resolves when the message has been logged to the
   * console and to a file.
   */
  info: async (message: unknown, dry = false) => await log(message, LogType.Info, dry),
  /**
   * Log a warning message.
   * @param message The message to log.
   * @param dry Whether to actually log the message or only return the output.
   * @returns A promise that resolves when the message has been logged to the
   * console and to a file.
   */
  warn: async (message: unknown, dry = false) => await log(message, LogType.Warn, dry),
  /**
   * Log an error message.
   * @param message The message to log.
   * @param dry Whether to actually log the message or only return the output.
   * @returns A promise that resolves when the message has been logged to the
   * console and to a file.
   */
  error: async (message: unknown, dry = false) => await log(message, LogType.Error, dry)
}
