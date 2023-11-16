import esbuild from 'esbuild'

const common = {
  bundle: true,
  minify: false,
  sourcemap: false,
  platform: 'browser',
  alias: {
    '@hashgraph/sdk': './node_modules/@hashgraph/sdk/src/index.js',
  },
}

esbuild.build({
  ...common,
  outfile: 'demo/dist/dApp/main.js',
  entryPoints: ['demo/src/dApp/main.ts'],
})

esbuild.build({
  ...common,
  outfile: 'demo/dist/wallet/main.js',
  entryPoints: ['demo/src/wallet/main.ts'],
})
