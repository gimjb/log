import fs from 'fs/promises'
import { inspect } from 'util'

let logPath = ''

export const padding = ' '.repeat('yyyy-mm-ddThh:mm:ss.mmmZ (ERROR): '.length)
type LogType = 'info' | 'warn' | 'error'

/**
 * Pads a new lines in a message with spaces.
 * @param message The message to pad.
 * @returns The padded message.
 */
function padMessage (message: string): string {
  return message.replace(/\n/g, '\n' + padding)
}

/**
 * Log a message to the console and to a file.
 * @param message The message to log.
 * @param type The type of log message.
 * @param dry Whether to actually log the message or only return the output.
 * @returns A promise that resolves when the message has been logged to the
 * console and to a file.
 */
async function log (message: unknown, type: LogType, dry = false): Promise<string> {
  let output = new Date().toISOString()
  let processedMessage = ''

  switch (typeof message) {
    case 'string':
      processedMessage += message
      break
    case 'object':
      processedMessage += inspect(message)
      break
    case 'undefined':
      processedMessage += 'undefined'
      break
    default:
      processedMessage += String(message)
      break
  }

  processedMessage = padMessage(processedMessage)

  switch (type) {
    case 'info':
      output += ` (INFO):  ${processedMessage}`
      if (!dry) console.info(output)
      break
    case 'warn':
      output += ` (WARN):  ${processedMessage}`
      if (!dry) console.warn(output)
      break
    case 'error':
      output += ` (ERROR): ${processedMessage}`
      if (!dry) console.error(output)
      break
  }

  if (!dry) await fs.appendFile(logPath, output + '\n')

  return output
}

/** A logger for the application. */
export default {
  /** The path to the log file. */
  get path (): string { return logPath },
  set path (path: string) { logPath = path },
  /**
   * Log an info message.
   * @param message The message to log.
   * @param dry Whether to actually log the message or only return the output.
   * @returns A promise that resolves when the message has been logged to the
   * console and to a file.
   */
  info: async (message: unknown, dry = false) => await log(message, 'info', dry),
  /**
   * Log a warning message.
   * @param message The message to log.
   * @param dry Whether to actually log the message or only return the output.
   * @returns A promise that resolves when the message has been logged to the
   * console and to a file.
   */
  warn: async (message: unknown, dry = false) => await log(message, 'warn', dry),
  /**
   * Log an error message.
   * @param message The message to log.
   * @param dry Whether to actually log the message or only return the output.
   * @returns A promise that resolves when the message has been logged to the
   * console and to a file.
   */
  error: async (message: unknown, dry = false) => await log(message, 'error', dry)
}
