import esbuild from 'esbuild'

esbuild.build({
  bundle: true,
  minify: false,
  platform: 'browser',
  format: 'esm',
  alias: {
    '@hashgraph/sdk': './node_modules/@hashgraph/sdk/src/index.js',
  },
  plugins: [
    copy({
      assets: {
        from: ['src/examples/**/*.html', 'src/examples/**/*.css'],
        to: ['dist/examples'],
      },
      watch: true,
    }),
  ],
  outdir: 'dist/examples/typescript',
  entryPoints: [
    'src/examples/typescript/main.ts',
    'src/examples/typescript/dapp/main.ts',
    'src/examples/typescript/wallet/main.ts',
  ],
})
