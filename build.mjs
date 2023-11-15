import esbuild from 'esbuild'
import fs from 'fs'

// https://esbuild.github.io/api/#main-fields-for-package-authors

const common = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  loader: {
    '.json': 'text',
  },
  // exports field in @hashgraph/sdk overwrites browser field
  // https://github.com/evanw/esbuild/issues/1275
  alias: {
    '@hashgraph/sdk': './node_modules/@hashgraph/sdk/src/index.js',
  },
  // logLevel: 'verbose',
  // alias: {
  //   '@': './src',
  // },
}

esbuild.build({
  ...common,
  format: 'cjs',
  platform: 'node',
  target: ['node18'],
  outfile: 'dist/node-cjs.js',
})

esbuild.build({
  ...common,
  format: 'esm',
  platform: 'node',
  target: ['node18'],
  outfile: 'dist/node-esm.js',
})

esbuild.build({
  ...common,
  format: 'esm',
  platform: 'browser',
  target: ['chrome58', 'firefox57', 'safari11', 'edge88'],
  outfile: 'dist/browser-esm.js',
})

esbuild.build({
  ...common,
  format: 'cjs',
  platform: 'browser',
  target: ['chrome58', 'firefox57', 'safari11', 'edge88'],
  outfile: 'dist/browser-cjs.js',
})

// TODO: generate types with tsc
// fs.mkdir('dist', console.error)
// fs.mkdir('dist', () => {})
// fs.copyFile('src/types/index.ts', 'dist/index.d.ts', () => {})
