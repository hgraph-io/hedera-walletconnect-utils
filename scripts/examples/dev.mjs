import * as esbuild from 'esbuild'
import { config } from './build.mjs'

const devConfig = {
  ...config,
  define: {
    'process.env.dappUrl': '"http://localhost:8080/dapp/index.html"',
    'process.env.walletUrl': '"http://localhost:8081/wallet/index.html"',
  },
}
console.log(devConfig)

let ctx8080 = await esbuild.context(devConfig)
let ctx8081 = await esbuild.context(devConfig)

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
