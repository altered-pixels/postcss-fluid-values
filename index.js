/**
 * @type {import('postcss').PluginCreator}
 */

/**
 * TODO: Add support for clamp-based syntax
 *
 * .selector {
 *   property: <min>;
 * }
 *
 * @media screen and (min-width: <start>) {
 *   .selector {
 *     property: clamp(<min>, <calculated>, <max>);
 *   }
 * }
 */
module.exports = () => {
  const pattern = /(?<min>-?[0-9]+)(?:px)?->(?<max>-?[0-9]+)(?:px)?/
  const indentPattern = /(\n[ ]+)/

  return {
    postcssPlugin: 'postcss-fluid-values',
    AtRule: {
      fluid: atRule => {
        const params = atRule.params
          .replace('(', '')
          .replace(')', '')
          .split(',')
        const start = parseInt(params[0])
        const end = parseInt(params[1])
        const startRules = []
        const endRules = []

        const query = atRule
          .clone()
          .removeAll()
          .assign({
            name: 'media',
            params: `screen and (min-width: ${start}px)`,
          })
        query.raws.afterName = ' '
        const endQuery = query
          .clone()
          .assign({ params: `screen and (min-width: ${end}px)` })

        atRule.walkRules(rule => {
          const startRule = rule.clone()
          startRule.cleanRaws()
          const endRule = rule.clone()
          const unchanging = []

          rule.walkDecls((decl, di) => {
            const match = decl.value.match(pattern)

            if (match) {
              const { min, max } = match.groups

              startRule.nodes[di].value = `${min}px`
              endRule.nodes[di].value = `${max}px`

              if (decl.value.startsWith('->')) {
                startRule.nodes[di].remove()
              }

              const p = (max - min) / (end - start)
              const c = min - start * p

              decl.value = `calc(${p * 100}vw + ${c}px)`
            } else {
              unchanging.push(decl.prop)
            }
          })

          if (rule.nodes.length !== unchanging.length) {
            rule.each(decl => {
              if (unchanging.includes(decl.prop)) {
                decl.remove()
              }
            })
            endRule.each(decl => {
              if (unchanging.includes(decl.prop)) {
                decl.remove()
              }
            })

            if (!query.nodes.length) {
              const beforeMatch = rule.raws.before.match(indentPattern)

              if (beforeMatch) {
                rule.raws.before = beforeMatch[0]
              }
            }

            if (!endRules.length) {
              const beforeMatch = endRule.raws.before.match(indentPattern)

              if (beforeMatch) {
                endRule.raws.before = beforeMatch[0]
              }
            }

            query.append(rule)
            endRules.push(endRule)
          } else {
            rule.remove()
          }

          startRules.push(startRule)
        })

        atRule.prepend(...startRules)

        if (query.nodes.length) {
          atRule.append(query)
        }

        if (endRules.length) {
          endQuery.append(...endRules)
          atRule.append(query, endQuery)
        }

        atRule.replaceWith(atRule.nodes)
      },
    },
  }
}

module.exports.postcss = true
