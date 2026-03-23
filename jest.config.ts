import type { Config } from 'jest'

const config: Config = {
  projects: [
    '<rootDir>/jest.config.unit.ts',
    '<rootDir>/jest.config.integration.ts',
  ],
}

export default config
