const postcss = require('postcss')
const fs = require('fs').promises
const { equal } = require('node:assert')
const { test } = require('node:test')

const plugin = require('./')

async function run(input, output, opts = {}) {
  let result = await postcss([plugin(opts)]).process(input, { from: undefined })
  equal(result.css, output)
  equal(result.warnings().length, 0)
}

test('creates fluid property values', async () => {
  const input = await fs.readFile('test/fluid.css', 'utf8')
  const output = await fs.readFile('test/fluid.expect.css', 'utf8')
  await run(input, output)
})

test('creates simplified property values using passed rem base', async () => {
  const input = await fs.readFile('test/fluid.css', 'utf8')
  const output = await fs.readFile('test/fluid.remBase.expect.css', 'utf8')
  await run(input, output, {
    remBase: 10,
  })
})

test('creates simplified fluid property values by passing defaults', async () => {
  const input = await fs.readFile('test/fluid.css', 'utf8')
  const output = await fs.readFile('test/fluid.defaults.expect.css', 'utf8')
  await run(input, output, {
    start: 600,
    end: 1200,
    containerStart: 400,
    containerEnd: 1000,
  })
})

test('creates pre-calculated fluid property values by all options', async () => {
  const input = await fs.readFile('test/fluid.css', 'utf8')
  const output = await fs.readFile('test/fluid.allOptions.expect.css', 'utf8')
  await run(input, output, {
    remBase: 10,
    start: 600,
    end: 1200,
    containerStart: 400,
    containerEnd: 1000,
  })
})
