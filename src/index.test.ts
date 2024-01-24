import log from './index'

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

    it('should log a string', async () => {
      const output = await logMethod('a string with\na new line', true)
      expect(output).toMatch(
        new RegExp(patternPrefix + `a string with\n${paddingPattern}a new line$`)
      )
    })

    it('should log an object', async () => {
      const output = await logMethod({ a: 'b' }, true)
      expect(output).toMatch(
        new RegExp(patternPrefix + /\{ a: 'b' \}$/.source)
      )
    })

    it('should log a circular object', async () => {
      const circular: any = {}
      circular.a = circular
      const output = await logMethod(circular, true)
      expect(output).toMatch(
        new RegExp(patternPrefix + /<ref \*1> \{ a: \[Circular \*1] \}$/.source)
      )
    })

    it('should log an array', async () => {
      const output = await logMethod(['a', 'b'], true)
      expect(output).toMatch(
        new RegExp(patternPrefix + /\[ 'a', 'b' \]$/.source)
      )
    })

    it('should log a number', async () => {
      const output = await logMethod(1, true)
      expect(output).toMatch(new RegExp(patternPrefix + '1$'))
    })

    it('should log a boolean', async () => {
      const output = await logMethod(true, true)
      expect(output).toMatch(new RegExp(patternPrefix + 'true$'))
    })

    it('should log a null', async () => {
      const output = await logMethod(null, true)
      expect(output).toMatch(new RegExp(patternPrefix + 'null$'))
    })

    it('should log an undefined', async () => {
      const output = await logMethod(undefined, true)
      expect(output).toMatch(new RegExp(patternPrefix + 'undefined$'))
    })
  })
}

testLogMethod('info')
testLogMethod('warn')
testLogMethod('error')
