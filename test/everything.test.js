const imports = {}

;(function setupHtml () {
   const fs = require('fs')
   const path = require('path')

   const currentDir = path.resolve()
   const parentDir = path.join(currentDir, '..')
   const htmlPath = path.join(parentDir, 'game.html')

   console.log(currentDir)
   console.log(parentDir)

   fs.readdirSync(currentDir).forEach(file => {
      console.log(file)
   })

   fs.readdirSync(parentDir).forEach(file => {
      console.log(file)
   })

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
