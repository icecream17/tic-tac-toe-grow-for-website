// eslint-disable-next-line
import { JSDOM } from 'jsdom'

let dom
let doc

// Setup block
// eslint-disable-next-line no-labels
beforeEach(() => {
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
      // document.open()
      // document.write(htmlCode)
      // document.close()

      dom = new JSDOM(htmlCode, { runScripts: 'dangerously' })
      doc = dom.window.document
      // console.debug(doc.documentElement.innerHTML.length)
   }

   // Note that the script tags in the html will automatically run
})

describe('setup', () => {
   test('html', () => {
      expect(doc.documentElement.innerHTML).toContain('Tic tac toe grow')
   })

   describe('js', () => {
      describe('imports from debug.js', () => {
         test('it exists', () => {
            expect(dom.window.imports).not.toBeUndefined()
         })
      })
   })
})

// Main code
test.todo('add tests')
