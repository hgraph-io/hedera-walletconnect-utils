import * as context from './context.mjs'

await Promise.all([
  context.nodeCjs.watch(),
  context.nodeEsm.watch(),
  context.browserEsm.watch(),
  context.browserCjs.watch(),
])
