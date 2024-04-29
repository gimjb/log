import log, { LogMode } from './index'

const datePattern = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/.source
// 34 is the total length of the date pattern, longest log type, parentheses,
// colon, and spaces: 'yyyy-mm-ddThh:mm:ss.mmmZ (ERROR): '.length === 34.
const paddingPattern = / {34}/.source

/**
 * Test a log method.
 *
 * @param {string} methodName
 * @returns {void}
 */
function testLogMethod (methodName: 'info' | 'warn' | 'error'): void {
  describe(`log.${methodName}`, () => {
    const logMethod = log[methodName]
    const patternPrefix = `^${datePattern} \\(${methodName.toUpperCase()}\\): {1,2}`
    const patternPostfix = /\n {4}at Object\.<anonymous> \(.+?\/src\/index\.test\.ts:\d+:\d+\)[\s\S]+$/.source

    it('should log a string', async () => {
      const output = await logMethod('a string with\na new line', true)
      expect(output).toMatch(
        new RegExp(patternPrefix + `a string with\n${paddingPattern}a new line` + patternPostfix)
      )
    })

    it('should log an object', async () => {
      const output = await logMethod({ a: 'b' }, true)
      expect(output).toMatch(
        new RegExp(patternPrefix + /\{ a: 'b' \}/.source + patternPostfix)
      )
    })

    it('should log a circular object', async () => {
      const circular: any = {}
      circular.a = circular
      const output = await logMethod(circular, true)
      expect(output).toMatch(
        new RegExp(patternPrefix + /<ref \*1> \{ a: \[Circular \*1] \}/.source + patternPostfix)
      )
    })

    it('should log an array', async () => {
      const output = await logMethod(['a', 'b'], true)
      expect(output).toMatch(
        new RegExp(patternPrefix + /\[ 'a', 'b' \]/.source + patternPostfix)
      )
    })

    it('should log a number', async () => {
      const output = await logMethod(1, true)
      expect(output).toMatch(new RegExp(patternPrefix + '1' + patternPostfix))
    })

    it('should log a boolean', async () => {
      const output = await logMethod(true, true)
      expect(output).toMatch(new RegExp(patternPrefix + 'true' + patternPostfix))
    })

    it('should log a null', async () => {
      const output = await logMethod(null, true)
      expect(output).toMatch(new RegExp(patternPrefix + 'null' + patternPostfix))
    })

    it('should log an undefined', async () => {
      const output = await logMethod(undefined, true)
      expect(output).toMatch(new RegExp(patternPrefix + 'undefined' + patternPostfix))
    })
  })
}

log.config.mode = LogMode.PlainText
testLogMethod('info')
testLogMethod('warn')
testLogMethod('error')
