const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFiles: [
    "<rootDir>/dotenv-config.js"
  ],
  setupFilesAfterEnv:[
    "<rootDir>/jest.helpers.ts"
  ],
  testEnvironment: 'node',
  testMatch: [
    "<rootDir>/**"
  ],
  verbose: true
}

module.exports = createJestConfig(customJestConfig)