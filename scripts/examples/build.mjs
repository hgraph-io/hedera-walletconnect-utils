import * as esbuild from 'esbuild'
import copy from 'esbuild-plugin-copy'

export const config = {
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
        from: ['src/examples/typescript/**/*.(html|css|ico)'],
        to: ['./'],
      },
      watch: true, // for ../dev.mjs
    }),
  ],
  outdir: 'dist/examples/typescript',
  entryPoints: [
    'src/examples/typescript/main.ts',
    'src/examples/typescript/dapp/main.ts',
    'src/examples/typescript/wallet/main.ts',
  ],
}

esbuild.build(config)
