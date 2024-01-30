/*
 *
 * Hedera Wallet Connect
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import fs from 'node:fs'
import * as esbuild from 'esbuild'
import * as ctx from './context.mjs'

/*
 * https://esbuild.github.io/analyze/
 *  - metafiles.json files are generated by this script to analyze the build
 */
esbuild.build(ctx.nodeCjs).then((result) => {
  fs.writeFileSync('dist/node-cjs-metafile.json', JSON.stringify(result.metafile))
})
esbuild.build(ctx.nodeEsm).then((result) => {
  fs.writeFileSync('dist/node-esm-metafile.json', JSON.stringify(result.metafile))
})
esbuild.build(ctx.browserCjs).then((result) => {
  fs.writeFileSync('dist/browser-cjs-metafile.json', JSON.stringify(result.metafile))
})
esbuild.build(ctx.browserEsm).then((result) => {
  fs.writeFileSync('dist/browser-esm-metafile.json', JSON.stringify(result.metafile))
})
