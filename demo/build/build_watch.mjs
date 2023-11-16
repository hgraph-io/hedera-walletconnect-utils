import esbuild from 'esbuild'

const common = {
  bundle: true,
  minify: false,
  sourcemap: false,
  platform: 'browser',
  format: 'esm',
  alias: {
    '@hashgraph/sdk': './node_modules/@hashgraph/sdk/src/index.js',
  },
}

let dAppCtx = await esbuild.context({
  ...common,
  outfile: 'demo/dist/dApp/main.js',
  entryPoints: ['demo/src/dApp/main.ts'],
})

let walletCtx = await esbuild.context({
  ...common,
  outfile: 'demo/dist/wallet/main.js',
  entryPoints: ['demo/src/wallet/main.ts'],
})

// await ctx.watch()
await Promise.all([dAppCtx.watch(), walletCtx.watch()])
console.log('I`m watching for dAppCtx and walletCtx...')

