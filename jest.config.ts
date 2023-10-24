import type { Config } from 'jest'

const config: Config = {
  detectOpenHandles: true,
  fakeTimers: {
    enableGlobally: true,
  },
  testMatch: ['**/?(*.)+(spec|test).ts?(x)', '!**/DAppConnector.test.ts'],
}

export default config
