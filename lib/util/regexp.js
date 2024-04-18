const NUMBER = '-?\\d+(?:\\.\\d+)?' // ['.x', '']
const CSS_VARIABLE_CHARS = `[a-zA-Z0-9-_]+`
const CSS_VARIABLE_VALUE = `(?:var)?\\(--${CSS_VARIABLE_CHARS}\\)`
const PX_OPT = '(?:px)?'

const MINMAX_NUMERIC = `(?:${NUMBER}${PX_OPT})`
const MINMAX_VARIABLE = `(?:${CSS_VARIABLE_VALUE})`
const MINMAX_VALUE = `${MINMAX_NUMERIC}|${MINMAX_VARIABLE}`

const MQ = `\\d+${PX_OPT}`

const FLUID = `(?<min>${MINMAX_VALUE})(?:@(?<start>${MQ}))?->(?<max>${MINMAX_VALUE})(?:@(?<end>${MQ}))?`
const FLUID_CONTAINER = `(?:container|c)\\(${FLUID}\\)`

const WRAP = '(\\([^()]+?\\))'
// TODO: Improve unit pattern
const UNIT = '[a-z]*'
const ZERO = `^0${UNIT}$`

const RESOLVED_VALUE = `^(?<value>${NUMBER})(?<unit>${UNIT})?$`

const PATTERNS = {
  fluid: new RegExp(FLUID),
  container: new RegExp(FLUID_CONTAINER),
  wrap: new RegExp(WRAP, 'g'),
  resolved: new RegExp(RESOLVED_VALUE),
  zero: new RegExp(ZERO),
  variable: new RegExp(CSS_VARIABLE_VALUE),
}

module.exports = {
  PATTERNS,
}
