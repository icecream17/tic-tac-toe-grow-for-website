const { DEFAULT_JEST_CONFIG } = require('jest-config')

const newConfig = Object.assign({}, DEFAULT_JEST_CONFIG)

// Use 2 spaces for import in this file to avoid creating yet another eslintrc
module.exports = Object.assign(newConfig, {
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  testEnvironment: 'jsdom',
  transform: {
    '\\.[jt]sx?$': 'babel-jest'
  },
  parserOptions: {
    sourceType: 'module'
  }
})
