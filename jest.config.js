const { DEFAULT_JEST_CONFIG } = require('jest-config')

const newConfig = Object.assign({}, DEFAULT_JEST_CONFIG)

module.exports = Object.assign(newConfig, {
   setupFilesAfterEnv: ['<rootDir>/jest-setup.js']
})
