import * as esbuild from 'esbuild'

// https://esbuild.github.io/api/#main-fields-for-package-authors
export const common = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  metafile: true,
  loader: {
    '.json': 'text',
  },
  // exports field in @hashgraph/sdk overwrites browser field
  // https://github.com/evanw/esbuild/issues/1275
  alias: {
    '@hashgraph/sdk': './node_modules/@hashgraph/sdk/src/index.js',
  },
  // external: ['./node_modules/@hashgraph/sdk/src/index.js'],
}

export const nodeCjs = {
  ...common,
  format: 'cjs',
  platform: 'node',
  target: ['node18'],
  outfile: 'dist/node-cjs.js',
}

export const nodeEsm = {
  ...common,
  format: 'esm',
  platform: 'node',
  target: ['node18'],
  outfile: 'dist/node-esm.js',
}

export const browserEsm = {
  ...common,
  format: 'esm',
  platform: 'browser',
  target: ['chrome58', 'firefox57', 'safari11', 'edge88'],
  outfile: 'dist/browser-esm.js',
}

export const browserCjs = {
  ...common,
  format: 'cjs',
  platform: 'browser',
  target: ['chrome58', 'firefox57', 'safari11', 'edge88'],
  outfile: 'dist/browser-cjs.js',
}
