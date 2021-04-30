const imports = {}

// Setup block
// eslint-disable-next-line no-useless-label
setup: {
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
      const htmlCode = fs.readFileSync(htmlPath)
      document.innerHTML = htmlCode // document is the parentNode of documentElement
   }

   // Setup imports
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
}

describe('check that setup worked', () => {
   test('html', () => {
      expect(document.body.innerText).toContain('Tic tac toe grow')
   })

   test('imports', () => {
      const importKeys = ['utils', 'errors', 'game', 'tournmanet', 'debug']
      expect(Object.keys(imports)).toEqual(importKeys)
      for (const key of importKeys) {
         expect(imports[key]).toBeInstanceOf(Object)
      }
   })
})

// Main code
test.todo('add tests')
