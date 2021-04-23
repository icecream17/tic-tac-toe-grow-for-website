let imports = {}

{
   (function setupHtml() {
       const fs = require('fs')
       document.write(fs.readFileSync('../game.html'))
       document.close() // "Tells the browser to finish loading the page"
       // https://developer.mozilla.org/en-US/docs/Web/API/Document/write
   })()

   (async function () {
      imports.utils = await import('../js/utils.js')
      imports.errors = await import('../js/errors.js')
      imports.game = await import('../js/game.js')
      imports.tournament = await import('../js/tournament.js')
      imports.debug = await import('../js/debug.js')
      main()
   })()
}

function main () {
   test.todo('add tests')
}
