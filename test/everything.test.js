const fs = require('fs')
const path = require('path')

// The current directory is assumed to be either of:
// <root repo dir>
// <root repo dir>/tests
const currentDir = path.resolve()
const repoRootDir =
   currentDir.includes('tests')
      ? path.join(currentDir, '..')
      : currentDir

// Setup html
{
   const htmlPath = path.join(repoRootDir, 'game.html')
   document.write(fs.readFileSync(htmlPath))
   document.close() // "Tells the browser to finish loading the page"
   // https://developer.mozilla.org/en-US/docs/Web/API/Document/write
}

// Setup imports
const imports = {}
{
   const jsDirPath = path.join(repoRootDir, 'js')
   function importModule (modulePath) {
      return require(path.join(jsDirPath, modulePath))
   }

   imports.utils = importModule('../js/utils.js')
   imports.errors = importModule('../js/errors.js')
   imports.game = importModule('../js/game.js')
   imports.tournament = importModule('../js/tournament.js')
   imports.debug = importModule('../js/debug.js')
}

describe('check that setup worked', () => {
   test('html', () => {
      expect(document.body.innerText).toContain('Tic tac toe grow')
   })

   test('imports', () => {
      const importKeys = ['utils', 'errors', 'game', 'tournmanet', 'debug']
      expect(Object.keys(imports)).toBeEqual(importKeys)
      for (const key of importKeys) {
         expect(imports[key]).toBeInstanceOf(Object)
      }
   })
})

// Main code
test.todo('add tests')
