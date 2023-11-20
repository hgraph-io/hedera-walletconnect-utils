import * as esbuild from 'esbuild'
import { config } from './build.mjs'

let ctx8080 = await esbuild.context(config)
let ctx8081 = await esbuild.context(config)

/*
 * watches for file changes and serves most recent files
 */
async function main() {
  ctx8080.serve({
    servedir: 'dist/examples/typescript',
    port: 8080,
  })
  ctx8081.serve({
    servedir: 'dist/examples/typescript',
    port: 8081,
  })
}

await main()
