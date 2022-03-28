const postcss = require('postcss')
const fs = require('fs').promises
const plugin = require('./')

async function run(input, output, opts = {}) {
  let result = await postcss([plugin(opts)]).process(input, { from: undefined })
  expect(result.css).toEqual(output)
  expect(result.warnings()).toHaveLength(0)
}

it('creates fluid property values', async () => {
  const input = await fs.readFile('test/fluid.css', 'utf8')
  const output = await fs.readFile('test/fluid.expect.css', 'utf8')
  await run(input, output)
})

it('outputs static property values', async () => {
  const input = await fs.readFile('test/static.css', 'utf8')
  const output = await fs.readFile('test/static.expect.css', 'utf8')
  await run(input, output)
})

it('outputs static and fluid property values', async () => {
  const input = await fs.readFile('test/mixed.css', 'utf8')
  const output = await fs.readFile('test/mixed.expect.css', 'utf8')
  await run(input, output)
})

// TODO: Add test for no fluid declarations
// TODO: Add tests for unit conversion (once implemented)
// TODO: Add tests for clamp syntax (once implemented)
