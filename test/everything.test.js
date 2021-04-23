const imports = {}

;(function setupHtml () {
   const fs = require('fs')
   const path = require('path')

   // The current directory is assumed to be either of:
   // <root repo dir>
   // <root repo dir>/tests
   const currentDir = path.resolve()
   const htmlPath =
      currentDir.includes('tests')
         ? path.join(currentDir, '..', 'game.html')
         : path.join(currentDir, 'game.html')

   document.write(fs.readFileSync(htmlPath))
   document.close() // "Tells the browser to finish loading the page"
   // https://developer.mozilla.org/en-US/docs/Web/API/Document/write
})()

;(async function importEverything () {
   imports.utils = await import('../js/utils.js')
   imports.errors = await import('../js/errors.js')
   imports.game = await import('../js/game.js')
   imports.tournament = await import('../js/tournament.js')
   imports.debug = await import('../js/debug.js')
   main()
})()

function main () {
   test.todo('add tests')
}
