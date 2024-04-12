/**
 * @type {import('postcss').PluginCreator}
 */
module.exports = (opts = {}) => {
  const {
    remBase,
    start: defaultStart,
    end: defaultEnd,
    containerStart: defaultContainerStart,
    containerEnd: defaultContainerEnd,
  } = opts

  const pattern =
    /(?<min>-?\d+)(?:px)?(?:@(?<start>\d+(?:px)?))?->(?<max>-?\d+)(?:px)?(?:@(?<end>\d+(?:px)?))?/
  const containerPattern =
    /(?:container|c)\(-?\d+(?:px)?(?:@\d+(?:px)?)?->-?\d+(?:px)?(?:@\d+(?:px)?)?\)/
  const wrapPattern = /(\([^()]+?\))/g
  const valuePattern = /^(?<value>-?\d+\.?\d*)(?<unit>[a-z]*)$/
  const zeroPattern = /^0[a-z]*$/

  const integerOrDecimal = value =>
    Number.isInteger(value) ? value : parseFloat(value.toFixed(5))

  // TODO: Test
  const extract = value => {
    if (!value.startsWith('(') || !value.endsWith(')')) return value
    const initialValue = value

    value = value.slice(1, -1)

    while (value.match(wrapPattern)) {
      value = value.replace(wrapPattern, '')
    }

    return value.match(/[()]/) ? initialValue : initialValue.slice(1, -1)
  }

  const isWrapped = value => {
    if (
      typeof value !== 'string' ||
      !value.startsWith('(') ||
      !value.endsWith(')')
    )
      return false
    value = value.slice(1, -1)

    while (value.match(wrapPattern)) {
      value = value.replace(wrapPattern, '')
    }

    return !value.match(/[()]/)
  }

  const wrap = value => {
    if (isWrapped(value)) return value

    return valuePattern.exec(value) ? value : `(${value})`
  }

  const calc = value => {
    value = extract(value)

    return valuePattern.exec(value) ? value : `calc(${value})`
  }

  const rem = value => {
    if (typeof remBase === 'number' && typeof value === 'number') {
      return `${integerOrDecimal(value / remBase)}rem`
    }

    return `(${value} / ${remBase ?? 'var(--rem-base, 16)'} * 1rem)`
  }

  const add = (v1, v2) => {
    if (zeroPattern.exec(v1)) return v2
    if (zeroPattern.exec(v2)) return v1

    if (typeof v2 === 'number') {
      if (typeof v1 === 'number') return v1 + v2

      const { value, unit } = valuePattern.exec(v1)?.groups ?? {}

      if (value) return withUnit(value + v2, unit)
    } else if (v2.startsWith('-')) return subtract(v1, v2.slice(1))

    if (typeof v1 === 'number') {
      const { value, unit } = valuePattern.exec(v2)?.groups ?? {}

      if (value) return withUnit(v1 + value, unit)
    }

    return `${v1} + ${v2}`
  }

  const subtract = (v1, v2) => {
    if (zeroPattern.exec(v1)) return v2
    if (zeroPattern.exec(v2)) return v1

    if (typeof v2 === 'number') {
      if (typeof v1 === 'number') return v1 - v2

      const { value, unit } = valuePattern.exec(v1)?.groups ?? {}

      if (value) return withUnit(value - v2, unit)
    } else if (v2.startsWith('-')) return add(v1, v2.slice(1))

    if (typeof v1 === 'number') {
      const { value, unit } = valuePattern.exec(v2)?.groups ?? {}

      if (value) return withUnit(v1 - value, unit)
    }

    return `${v1} - ${v2}`
  }

  const multiply = (v1, v2) => {
    if (zeroPattern.exec(v1) || zeroPattern.exec(v2)) return 0
    if (v1 === 1) return v2
    if (v2 === 1) return v1

    if (typeof v1 === 'number' && typeof v2 === 'number') {
      return v1 * v2
    }

    return `${wrap(v1)} * ${wrap(v2)}`
  }

  const divide = (v1, v2) => {
    if (zeroPattern.exec(v1) || zeroPattern.exec(v2)) return 0
    if (v2 === 1) return v1

    if (typeof v1 === 'number' && typeof v2 === 'number') {
      return integerOrDecimal(v1 / v2)
    }

    return `${wrap(v1)} / ${wrap(v2)}`
  }

  const withUnit = (value, unit) => {
    if (typeof value === 'number') {
      return `${value}${unit}`
    }

    return `(${value} * 1${unit})`
  }

  const values = match =>
    Object.entries(match.groups ?? {}).reduce(
      (values, [key, value]) => ({
        ...values,
        [key]: value ? Number(value) : undefined,
      }),
      {}
    )

  return {
    postcssPlugin: 'postcss-fluid-values',
    Declaration(decl, postcss) {
      const match = pattern.exec(decl.value)
      if (match) {
        const useContainer = containerPattern.exec(decl.value)
        const unit = useContainer ? 'cqi' : 'vw'
        let { min, max, start, end } = values(match)

        const target = useContainer?.[0] ?? match[0]

        // TODO: Update, expose, or remove container defaults
        start ??= useContainer
          ? defaultContainerStart ?? 'var(--fluid-container-start, 300)'
          : defaultStart ?? 'var(--fluid-start, 390)'
        end ??= useContainer
          ? defaultContainerEnd ?? 'var(--fluid-container-end, 800)'
          : defaultEnd ?? 'var(--fluid-end, 1440)'

        const allValuesKnown =
          typeof remBase === 'number' &&
          typeof min === 'number' &&
          typeof max === 'number' &&
          typeof start === 'number' &&
          typeof end === 'number'

        const minValue = rem(min)
        const maxValue = rem(max)

        // TODO: Remove this conditional and update test expectations to match new formula
        if (allValuesKnown) {
          const v = withUnit(
            divide(multiply(100, subtract(max, min)), subtract(end, start)),
            unit
          )
          const c = rem(
            divide(
              subtract(multiply(start, max), multiply(end, min)),
              subtract(start, end)
            )
          )

          decl.value = decl.value.replace(
            target,
            `clamp(${calc(minValue)}, ${add(v, c)}, ${calc(maxValue)})`
          )
          return
        }

        const value = add(
          rem(min),
          multiply(
            subtract(max, min),
            divide(`100${unit} - ${rem(start)}`, subtract(end, start))
          )
        )

        decl.value = decl.value.replace(
          target,
          `clamp(${calc(minValue)}, ${value}, ${calc(maxValue)})`
        )
      }
    },
  }
}

module.exports.postcss = true
