import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest/presets/js-with-ts',
  detectOpenHandles: true,
  fakeTimers: {
    enableGlobally: true,
  },
  testMatch: ['**/?(*.)+(spec|test).ts?(x)'],
  transformIgnorePatterns: ['node_modules/(?!@walletconnect)'],
}

export default config
