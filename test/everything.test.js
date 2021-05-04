
// Setup block
// eslint-disable-next-line no-labels
setup: {
   const fs = require('fs')
   const path = require('path')
   const process = require('process')

   // The current directory is assumed to be either of:
   // <root repo dir>
   // <root repo dir>/tests
   const currentDir = path.resolve()
   const repoRootDir =
      currentDir.includes('tests')
         ? path.join(currentDir, '..')
         : currentDir

   process.chdir(repoRootDir)

   // Setup html
   {
      const htmlPath = path.join(repoRootDir, 'game.html')
      const htmlCode = fs.readFileSync(htmlPath).toString()
      document.open()
      document.write(htmlCode)
      document.close()
   }

   // Note that the script tags in the html will automatically run
}

describe('setup', () => {
   test('html', () => {
      expect(document.body.innerText).toContain('Tic tac toe grow')
   })

   describe('js', () => {
      describe('globalThis.imports from debug.js', () => {
         test('it exists', () => {
            expect(globalThis).toHaveProperty('imports')
         })
      })
   })
})

// Main code
test.todo('add tests')
