// This is licensed under the Apache License 2.0,
// see https://github.com/icecream17/tic-tac-toe-grow-for-website/blob/main/LICENSE

// Note: The CustomError class is not licensed under the Apache License 2.0
// Note: The comments are in the public domain.

// Note: activePlayers, activeBots, activePeople, people, bots, and players ARE defined. But globally, in players.js

import { ERRORS, ElementIsDisabledError, ElementIsAlreadyEnabledError, ElementIsAlreadyDisabledError, DidntChangeError, NOT_DONE_YET } from './errors.js'
import { player_assets, PLAYER_CHARS, PLAYER_BORDERS, PLAYER_NAMES, PlayerReference } from './players.js'

// The log levels used are:
// verbose, by console.debug
// info, by console.info or console.log

import { pause, valuesEqual } from './utils.js'

export class Position {
   constructor (x, y) {
      this.x = x
      this.y = y
   }

   /** Returns the manhattan distance from another position */
   distance (position) {
      return Math.abs(this.x - position.x) + Math.abs(this.y - position.y)
   }

   /** Method returning a shallow copy of the position */
   copy () {
      return new Position(this.x, this.y)
   }
}

class Step {
   constructor (vx, vy) {
      this.vx = vx
      this.vy = vy
   }
}

class Cell extends Position {
   constructor (value, x, y) {
      super(x, y)
      this.value = value
      this.win = false // Idea: setter errors when value is '' or ' '
      this.moveIndex = null // Index when a move is played on that square
   }
}

class Move extends Position {
   // "Move" is highly bound to the class "Game".
   // super(newXY.x, newXY.y);
   // this.index = game.moveHistory.length
   constructor (oldXY, newXY, player, game = currentGame) {
      super(newXY.x, newXY.y)
      this.game = game
      this.index = game.moveHistory.length // must be true
      this.player = player
      this.positionAtLastUpdate = new Position(this.x, this.y)
      this.lastUpdateIndex = this.index

      this.originalPosition = oldXY // No board update
   }

   // Get the gameState on demand instead of using unneccesary storage
   get gameState () {
      return this.game.getGameStateAt(this.index)
   }

   /**
    * The board might've updated, and gotten a new row to the left for example.
    * So this getter method gets the updated position of a move.
    */
   get correspondingPosition () {
      for (; this.lastUpdateIndex < this.game.moveHistory.length; this.lastUpdateIndex++) {
         const nextMove = this.game.moveHistory[this.lastUpdateIndex].originalPosition
         if (nextMove.x === 0) { this.positionAtLastUpdate.x++ }
         if (nextMove.y === 0) { this.positionAtLastUpdate.y++ }
      }
      return this.positionAtLastUpdate.copy()
   }

   updatedDistance (position) {
      const updatedPosition = this.correspondingPosition
      return Math.abs(updatedPosition.x - position.x) +
           Math.abs(updatedPosition.y - position.y)
   }
}

class GameBase {
   #MAX_LENGTH = 511
   #MAX_TURNS = 314
   static INITIAL_MAX_LENGTH = 511
   static INITIAL_MAX_TURNS = 314
   static MIN_PLAYERS = 2

   constructor (participants) {
      this.turn = 0 /** Starts at 0 */
      this.ply = 0
      this.toMove = 0 // index in player array
      this.result = null
      this.participants = participants ?? players
      this.winners = []

      this.board = [
         [new Cell(' ', 0, 0), new Cell(' ', 0, 1), new Cell(' ', 0, 2)],
         [new Cell(' ', 1, 0), new Cell(' ', 1, 1), new Cell(' ', 1, 2)],
         [new Cell(' ', 2, 0), new Cell(' ', 2, 1), new Cell(' ', 2, 2)]
      ] // WARNING: this.board[y][x]
      this.board.width = 3
      this.board.height = 3 // same as this.board.length

      this.moveHistory = []
   }

   // NOTE: No value validation.
   set MAX_LENGTH (value) { this.#MAX_LENGTH = value }
   get MAX_LENGTH () { return this.#MAX_LENGTH }
   set MAX_TURNS (value) { this.#MAX_TURNS = value }
   get MAX_TURNS () { return this.#MAX_TURNS }

   get playerToMove () {
      return this.participants[this.toMove]
   }

   setCell (x, y, value) {
      this.board[y][x] = new Cell(value, x, y)
   }

   // No update function provided!

   updateBoard (x, y) {
      // Possible bug in the future, the else ifs assume that the
      // first cell is not the same as the last cell, which would be untrue if
      // the board was somehow one cell big.

      // Since we grow the board down at the 4 ifs,
      // the (i === x ? ' ' : '') is redundant
      if (y === 0) {
         this.board.unshift([])
         for (let i = 0; i < this.board.width; i++) {
            this.board[0].push(
               new Cell(i === x ? ' ' : '', i, 0)
            )
         }
         this.board.height++; y++
      } else if (y === this.board.height - 1) {
         this.board.push([])
         this.board.height++
         for (let i = 0; i < this.board.width; i++) {
            this.board[this.board.height - 1].push(
               new Cell(i === x ? ' ' : '', i, this.board.height - 1)
            )
         }
      }

      if (x === 0) {
         for (let i = 0; i < this.board.length; i++) {
            this.board[i].unshift(
               new Cell(i === y ? ' ' : '', i, 0)
            )
         }
         this.board.width++; x++
      } else if (x === this.board.width - 1) {
         for (let i = 0; i < this.board.length; i++) {
            this.board[i].push(
               new Cell(i === y ? ' ' : '', i, this.board.width)
            )
         }
         this.board.width++
      }

      if (this.board[y - 1][x].value === '') { this.setCell(x, y - 1, ' ') }
      if (this.board[y + 1][x].value === '') { this.setCell(x, y + 1, ' ') }
      if (this.board[y][x - 1].value === '') { this.setCell(x - 1, y, ' ') }
      if (this.board[y][x + 1].value === '') { this.setCell(x + 1, y, ' ') }

      this.board[y][x] = new Cell(PLAYER_CHARS[this.toMove], x, y)
      this.board[y][x].moveIndex = this.moveHistory.length

      for (let y2 = 0; y2 < this.board.length; y2++) {
         for (let x2 = 0; x2 < this.board.width; x2++) {
            this.board[y2][x2].y = y2
            this.board[y2][x2].x = x2
         }
      }

      return this.board[y][x]
   }

   updateGameEnd (result, lastX, lastY) {
      // Even if a win happens after a draw, or a draw happens after a win,
      // or even a win happens after a win, *only the first result counts*.
      this.result ??= result[0]

      // Converted from an "if, else if, else" statement.
      switch (result[0]) {
      case 'win':
         {
            notice('WINNNN', result)
            for (const cell of result[1].flat().concat(this.board[lastY][lastX])) {
               cell.win = true
            }

            const winArray = [this.toMove, PLAYER_NAMES[this.toMove], this.playerToMove.player]
            if (this.winners.every(array => !valuesEqual(array, winArray))) {
               this.winners.push(winArray)
            }
         }
         break
      case 'draw':
         notice(`*gasp*! Draw!\n${result[1]}`, result)
         break
      default:
         ERRORS.INVALID_MOVE_FINISH.rethrow()
      }
   }

   checkGameEnd (x, y) {
      const win = this.checkWin(x, y)
      if (win) { return ['win', win] }

      // In this case, a switch statement would be worse.
      if (this.board.width > 7 * this.board.height) {
         return ['draw', 'width is 7 times the height']
      } else if (this.board.height > 7 * this.board.width) {
         return ['draw', 'height is 7 times the width']
      } else if (this.turn >= this.MAX_TURNS) {
         return ['draw', `max turns reached (${Game.MAX_TURNS})`]
      } else if (this.board.width >= this.MAX_LENGTH) {
         return ['draw', `max length reached by width (${Game.MAX_LENGTH})`]
      } else if (this.board.height >= this.MAX_LENGTH) {
         return ['draw', `max length reached by height (${Game.MAX_LENGTH})`]
      } else {
         return false
      }
   }

   checkWin (x, y) {
      const playerValue = this.board[y][x].value
      const wins = []
      const orthogonal = [[], [], [], []]
      const diagonal = [[], [], [], []]

      // Arrow function so that "this" is not undefined
      const goDiagonal = (x2, y2, step) => {
         const diag = [this.board[y2][x2]]
         const currentPos = new Position(x2, y2)

         // Intentional loop condition
         while (true) {
            currentPos.x += step.vx
            currentPos.y += step.vy
            const square = this.board[currentPos.y]?.[currentPos.x]

            if (square?.value !== playerValue) { break }
            diag.push(square)
         }

         return diag
      }

      for (let i = 0; i < 4; i++) {
         const orthogonalStep = [
            new Step(-1, 0),
            new Step(1, 0),
            new Step(0, 1),
            new Step(0, -1)
         ][i]

         const diagonalStep = [
            new Step(1, 1),
            new Step(1, -1),
            new Step(-1, 1),
            new Step(-1, -1)
         ][i]

         orthogonal[i] = goDiagonal(x, y, orthogonalStep)
         diagonal[i] = goDiagonal(x, y, diagonalStep)
      }

      // good good good n good good good
      // n 1 1 1 n 2 2 2
      function sevenNArow (oneDirection, oppositeDirection) {
         if (oneDirection.length + oppositeDirection.length >= 8) {
            return oneDirection.slice(1).concat(...oppositeDirection)
         } else {
            return false
         }
      }

      function checkMark (side1, side2) {
         if (isValidCheckmark(side1, side2)) {
            return side1.slice(1).concat(...side2)
         } else {
            return false
         }
      }

      function isValidCheckmark (side1, side2) {
         return (side1.length >= 2 && side2.length >= 4) ||
                (side1.length >= 4 && side2.length >= 2)
      }

      const sevenChecks = [
         sevenNArow(orthogonal[0], orthogonal[1]),
         sevenNArow(orthogonal[2], orthogonal[3]),
         sevenNArow(diagonal[0], diagonal[3]),
         sevenNArow(diagonal[1], diagonal[2])
      ]

      for (const sevenNArowCheck of sevenChecks) {
         if (sevenNArowCheck) {
            wins.push(sevenNArowCheck)
         }
      }

      const rightAngleMarkChecks = [
         checkMark(diagonal[0], diagonal[1]),
         checkMark(diagonal[0], diagonal[2]),
         checkMark(diagonal[3], diagonal[1]),
         checkMark(diagonal[3], diagonal[2])
      ]

      for (const markCheck of rightAngleMarkChecks) {
         if (markCheck) {
            wins.push(markCheck)
         }
      }

      // arrow function in order to access "this"
      // arguments = diagonal, oppositeDiagonal, perpendicularStep, oppositePerpendicularStep
      const checkmarks = (diag, oppDiag, perpStep, oppPerpStep) => {
         // The way the diags work:
         // above, the squares are pushed onto the array, *away* from the xy.
         // So the diag arrays' first elements are the ones in the diag closer to the xy
         const newWins = []

         // The checkmarks are made of the opposite diagonal,
         // plus this diagonal (minus the shared cell), which make one big side,
         // then the other perpendicular sides.
         let currBase = [...oppDiag.slice(1), diag[0]] // Reordering cells
         for (const square of diag.slice(1)) {
            currBase.push(square)
            const perpDiag = goDiagonal(square.x, square.y, perpStep)
            const oppPerpDiag = goDiagonal(square.x, square.y, oppPerpStep)
            if (isValidCheckmark(currBase, perpDiag)) { newWins.push([...currBase, ...perpDiag.slice(1)]) }
            if (isValidCheckmark(currBase, oppPerpDiag)) { newWins.push([...currBase, ...oppPerpDiag.slice(1)]) }
         }

         currBase = [...diag.slice(1), diag[0]]
         for (const square of oppDiag.slice(1)) {
            currBase.push(square)
            const perpDiag = goDiagonal(square.x, square.y, perpStep)
            const oppPerpDiag = goDiagonal(square.x, square.y, oppPerpStep)
            if (isValidCheckmark(currBase, perpDiag)) { newWins.push([...currBase, ...perpDiag.slice(1)]) }
            if (isValidCheckmark(currBase, oppPerpDiag)) { newWins.push([...currBase, ...oppPerpDiag.slice(1)]) }
         }

         return newWins
      }

      wins.push(...checkmarks(diagonal[0], diagonal[3], new Step(1, -1), new Step(-1, 1)))
      wins.push(...checkmarks(diagonal[1], diagonal[2], new Step(1, 1), new Step(-1, -1)))

      return wins.length ? wins : false // If there is a win return wins
   }

   getMoves () {
      const moves = []
      for (let y = 0; y < this.board.height; y++) {
         for (let x = 0; x < this.board.width; x++) {
            if (this.board[y][x].value === ' ') { moves.push(new Position(x, y)) }
         }
      }
      return moves
   }

   // Adds padding to left and right
   getAscii () {
      let ascii = `+-${'-'.repeat(this.board.width)}-+\n`
      for (let y = 0; y < this.board.length; y++) {
         ascii += '| '
         for (let x = 0; x < this.board.width; x++) {
            if (this.board[y][x].value === '') { ascii += ' ' } else if (this.board[y][x].value === ' ') { ascii += '.' } else { ascii += this.board[y][x].value }
         }
         ascii += ' |\n'
      }
      return (ascii += `+-${'-'.repeat(this.board.width)}-+`)
   }

   logAscii (verbose) {
      let ascii = `%c+%c-${'-'.repeat(this.board.width)}-%c+\n`
      const css = [
         'color:white',
         'background-color:gray;color:gray',
         'color:white'
      ]

      for (let y = 0; y < this.board.length; y++) {
         ascii += '%c|%c '
         css.push('color:white', 'background-color:gray')

         for (let x = 0; x < this.board.width; x++) {
            const char = this.board[y][x].value
            ascii += '%c'
            if (char === '') {
               ascii += ' '
               css.push('background-color:gray')
            } else if (char === ' ') {
               ascii += '.'
               css.push('color:white')
            } else if (PLAYER_CHARS.includes(char)) {
               ascii += char
               css.push(
                  `color:${
                     ['red', 'blue', 'green', 'orange', 'purple'][PLAYER_CHARS.indexOf(char)]
                  }${this.board[y][x].win ? ';background-color:#CFC' : ''}`
               )
            }
         }

         ascii += '%c %c|\n'
         css.push('background-color:gray', 'color:white')
      }
      ascii += `%c+%c-${'-'.repeat(this.board.width)}-%c+\n`
      css.push(
         'color:white',
         'background-color:gray;color:gray',
         'color:white'
      )

      if (verbose) { console.debug(ascii, ...css) } else { console.log(ascii, ...css) }
   }
}

class GameState extends GameBase {
   constructor (game) {
      super()
      this.game = game
   }

   doMove (move) {
      let { x, y } = move.originalPosition
      if (this.board[y][x].value !== ' ') { ERRORS.SQUARE_NOT_UPDATED.rethrow() }

      // () To prevent parsing as a block
      ({ x, y } = Game.prototype.updateBoard.call(this, x, y))

      const moveFinish = Game.prototype.checkGameEnd.call(this, x, y)
      if (moveFinish !== false) { Game.prototype.updateGameEnd.call(this, moveFinish, x, y) }

      this.moveHistory.push(move)
      this.ply++
      this.toMove = (this.toMove + 1) % this.participants.length
      if (this.toMove === 0) { this.turn++ }
   }

   get originalMoves () {
      const moves = []
      for (let y = 0; y < this.board.height; y++) {
         for (let x = 0; x < this.board.width; x++) {
            if (this.board[y][x].value === ' ') { moves.push(new Position(x, y)) }
         }
      }
      return moves
   }

   get correspondingMoves () {
      const moves = this.originalMoves
      for (const move of moves) {
         for (
            let index = this.moveHistory.length;
            index < this.game.moveHistory.length;
            index++
         ) {
            const nextMove = this.game.moveHistory[index].originalPosition
            if (nextMove.x === 0) { move.x++ }
            if (nextMove.y === 0) { move.y++ }
         }
      }
      return moves
   }
}

export class Game extends GameBase {
   constructor (participants, visual = true) {
      if (visual) {
         participants = players
      }
      super(participants)

      if (visual) {
         this.visual = []
         this.visual.offset = new Position(0, 0)
         this.visualStart()
      } else {
         this.isSimulation = true
      }
   }

   visualStart () {
      // the top-left of the board is 0, 0
      // second row is 1, 0
      // third row, seventh column is 3, 7

      for (let y = 0; y < this.board.length; y++) {
         for (let x = 0; x < this.board.width; x++) {
            if (this.board[y][x].value !== '') {
               ELEMENTS.getSquare(
                  this.visual.offset.x + x,
                  this.visual.offset.y + y
               ).className = 'board'
            }
         }
      }
   }

   play (x, y) {
      this.update(x, y)
      this.playBots()
      this.logAscii(true)
   }

   async playBots () {
      if (this.playerToMove.type === 'bot') {
         await pause(200)
         this.doBotMove()
      }

      this.logAscii(true)
   }

   update (x, y) {
      console.debug(`(update) move: ${x} ${y}`)

      if (this.board[y][x].value !== ' ') { throw ERRORS.SQUARE_NOT_UPDATED.rethrow() }

      const oldPosition = { x, y };
      ({ x, y } = this.updateBoard(x, y))

      const moveFinish = this.checkGameEnd(x, y)
      if (moveFinish !== false) { this.updateGameEnd(moveFinish, x, y) }

      this.moveHistory.push(new Move(oldPosition, { x, y }, this.playerToMove, this))
      this.playerToMove.lastMove = this.moveHistory[this.moveHistory.length - 1]

      // updateVisual must go after setting lastMove but before setting toMove
      if (this === currentGame) { this.updateVisual() }

      this.ply++
      this.toMove = (this.toMove + 1) % this.participants.length
      if (this.toMove === 0) { this.turn++ }

      // But this must go after setting turn
      if (this === currentGame) { this.updateVisualStats() }

      console.debug(`(update) move: ${x} ${y}, moveFinish: ${moveFinish}`)
   }

   updateVisualStats () {
      ELEMENTS.statsParagraph.innerText =
`Width: ${this.board.width}
Height: ${this.board.height}
Turns: ${this.turn}`
   }

   // Same as visualStart really
   updateVisual () {
      for (let y = 0; y < 20; y++) {
         for (let x = 0; x < 20; x++) {
            const button = ELEMENTS.getSquare(x, y)
            const cell = this.board?.[y - this.visual.offset.y]?.[x - this.visual.offset.x]

            // undefined or empty string
            button.classList.remove('board', 'win')
            button.style.removeProperty('border-color')
            button.style.removeProperty('background-color')
            button.style.removeProperty('background-image')

            // Assumes (cell === undefined || cell.value !== undefined)
            if (cell === undefined || cell.value === '') { continue } else { button.classList.add('board') }

            if (cell.value !== ' ') {
               const playerIndex = PLAYER_CHARS.indexOf(cell.value)
               if (playerIndex === -1 && !cell.win) {
                  button.style.backgroundColor = 'red'
               } else {
                  button.style.backgroundImage = `url("${player_assets[playerIndex]}")`
               }

               button.classList.add('board')
               if (cell.win) {
                  button.classList.add('win')
               } else if (this.participants?.[playerIndex].lastMove?.index === cell.moveIndex) {
                  button.style.borderColor = PLAYER_BORDERS[playerIndex]
               }
            }
         }
      }
      // Outer for doesn't need brackets
   }

   // Gets the game state *before* a move is played
   // So if moveIndex was 0, it would get the starting position
   getGameStateAt (moveIndex) {
      const gameCopy = new GameState(this)
      for (let i = 0; i < moveIndex; i++) {
         gameCopy.doMove(this.moveHistory[i])
      }

      return gameCopy
   }

   // Change tournament#botMoveFunc too
   doBotMove () {
      if (this.playerToMove.player.type === 'bot') {
         this.playerToMove.player.play(this)
      } else {
         console.info("Player must've changed into a human")
      }
   }
}

function handleClick (x, y) {
   console.debug('Click!', x, y)
   x -= currentGame.visual.offset.x
   y -= currentGame.visual.offset.y

   const square = currentGame.board?.[y]?.[x]
   if (square === undefined) {
      ERRORS.EVIL_CLICK.rethrow()
   }

   if (players[currentGame.toMove].type === 'human' && square.value === ' ') {
      currentGame.play(x, y)
   }
}

function notice (...args) {
   // TODO: Implement this

   console.info(...args)
   return NOT_DONE_YET
}

export const ELEMENTS = {
   container: document.getElementById('container'),
   infoElement: document.querySelector('#container aside'),
   gameDataElement: document.getElementById('gameData'),
   numPeopleSelect: document.querySelector('#personCountLabel select'),
   numPlayersSelect: document.querySelector('#playerAmountLabel select'),
   resetGameButton: document.getElementById('resetGame'),
   shifts: document.querySelectorAll('#mapControls button'),
   statsParagraph: document.getElementById('nonPlayerStats'),
   squares: [],

   getSquare (x, y) {
      return document.getElementById(`${x}-${y}`)
   },

   // {b} is unneccesary in {a b c}, the space selects all children
   // TODO: Only have a getter for non-constant elements
   usernameInputs: document.querySelectorAll('#nameFields fieldset input'),
   enablePersonButtons: document.querySelectorAll('#nameFields fieldset button.enable'),
   disablePersonButtons: document.querySelectorAll('#nameFields fieldset button.disable'),
   enablePlayerButtons: document.querySelectorAll('#choosePlayerFields button.enable'),
   disablePlayerButtons: document.querySelectorAll('#choosePlayerFields button.disable'),

   playerSelects: document.querySelectorAll('#choosePlayerFields label select'),
   getEnabledPlayerSelects () {
      return document.querySelectorAll('#choosePlayerFields label select:enabled')
   }
}

// up down left right
ELEMENTS.shifts[0].onclick = () => {
   currentGame.visual.offset.y++
   currentGame.updateVisual()
}
ELEMENTS.shifts[1].onclick = () => {
   currentGame.visual.offset.y--
   currentGame.updateVisual()
}
ELEMENTS.shifts[2].onclick = () => {
   currentGame.visual.offset.x--
   currentGame.updateVisual()
}
ELEMENTS.shifts[3].onclick = () => {
   currentGame.visual.offset.x++
   currentGame.updateVisual()
}

for (let x = 0; x < 20; x++) {
   ELEMENTS.squares[x] = []
   for (let y = 0; y < 20; y++) {
      const element = document.createElement('button')
      ELEMENTS.squares[x].push(element)

      element.id = `${x}-${y}`
      element.setAttribute('aria-label', `Square at ${x}-${y}`)
      element.style.gridColumn = x + 1
      element.style.gridRow = y + 1
      element.onclick = handleClick.bind(element, x, y)
      ELEMENTS.container.appendChild(element)
   }
}

const gameHistory = []
globalThis.currentGame = new Game()

ELEMENTS.resetGameButton.onclick = function resetGame () {
   gameHistory.push(currentGame)
   currentGame = new Game()
   currentGame.updateVisual()
   currentGame.updateVisualStats()
}

// Assumes that the enable and disable buttons are disabled / enabled when appropriate.
// For example, the enable button should not be enabled if the element is already enabled.
// So the errors might be wrong.

// Note: <var> <input>
ELEMENTS.numPeopleSelect.onchange = function (event) {
   console.debug(EnableOrDisablePeople.call(event.target))
}
ELEMENTS.numPlayersSelect.onchange = function (event) {
   console.debug(EnableOrDisablePlayers.call(event.target))
}
for (const input of ELEMENTS.usernameInputs) {
   input.onchange = function usernameChange (event) {
      if (event.target.disabled) { throw new ElementIsDisabledError(event.target) }
      console.debug(changeName.call(event.target))
   }
}
for (const button of ELEMENTS.enablePersonButtons) {
   button.onclick = function (event) {
      if (event.target.disabled) { throw new ElementIsAlreadyEnabledError(event.target) }
      console.debug(enablePerson.call(event.target.parentElement.children[0].children[1]))
   }
}
for (const button of ELEMENTS.disablePersonButtons) {
   button.onclick = function (event) {
      if (event.target.disabled) { throw new ElementIsAlreadyDisabledError(event.target) }
      console.debug(disablePerson.call(event.target.parentElement.children[0].children[1]))
   }
}
for (const select of ELEMENTS.playerSelects) {
   select.onchange = function playerChange (event) {
      if (event.target.disabled) { throw new ElementIsDisabledError(event.target) }
      console.debug(changePlayer.call(event.target))
   }
}
for (const button of ELEMENTS.enablePlayerButtons) {
   button.onclick = function (event) {
      if (event.target.disabled) { throw new ElementIsAlreadyEnabledError(event.target) }
      console.debug(enablePlayer.call(event.target.parentElement.children[0].children[1]))
   }
}
for (const button of ELEMENTS.disablePlayerButtons) {
   button.onclick = function (event) {
      if (event.target.disabled) { throw new ElementIsAlreadyDisabledError(event.target) }
      console.debug(disablePlayer.call(event.target.parentElement.children[0].children[1]))
   }
}

// These async functions are really fast
// They might not even need to be async functions,
// But it's nice and I might need them for tournaments.

/* async function          this                          event element (if different)
 * EnableOrDisablePlayers  #playerAmountLabel <select>
 * EnableOrDisablePeople   #personCountLabel <select>
 * changePlayer            #choosePlayerFields <select>
 * changeName              #nameFields <input>
 * enablePerson            #nameFields <input>           #nameFields <button.enable>
 * disablePerson           #nameFields <input>           #nameFields <button.disable>
 * enablePeople            undefined                     used in EnableOrDisablePeople
 * disablePeople           undefined                     used in EnableOrDisablePeople
 * enablePlayer            #choosePlayerFields <select>  #choosePlayerFields <button.enable>
 * disablePlayer           #choosePlayerFields <select>  #choosePlayerFields <button.disable>
 * enablePlayers           undefined                     used in EnableOrDisablePlayers
 * disablePlayers          undefined                     used in EnableOrDisablePlayers
 *
 * <this> = <select> or <input> in general
 *
 * ....[10] = "Username #A"
 * ....[8]  = "Player #8"
 */

// Some of these functions access the ID of an element, like this.parentElement.id[8]
// which corresponds to the last character in the IDs, in this case "whoPlaysN"
// The IDs are 1-based index, so subtract one a lot of the time.

// Much of the code is repeated, for example
/*
   let promiseGroup = await Promise.allSettled(clickPromises);
   for (let promise of promiseGroup)
      if (promise.status === 'rejected') throw new AggregateError(promiseGroup);
*/

// this = #playerAmountLabel <select>
async function EnableOrDisablePlayers () {
   if (this.value < activePlayers) {
      return await disablePlayers(Number(this.value))
   } else if (this.value > activePlayers) {
      return await enablePlayers(Number(this.value))
   } else {
      throw new DidntChangeError()
   }
}

// this = #personCountLabel <select>
async function EnableOrDisablePeople () {
   if (this.value < activePeople) {
      return await disablePeople(Number(this.value))
   } else if (this.value > activePeople) {
      return await enablePeople(Number(this.value))
   } else {
      throw new DidntChangeError()
   }
}

// this = <select>
async function changePlayer () {
   const option = this.selectedOptions[0]
   option.selected = true

   const type = option.parentElement.label === 'Bots' ? 'bot' : 'human' // <optgroup> label

   const playerIndex = this.parentElement.id[8] - 1
   if (players[playerIndex].type !== type) {
      if (type === 'bot') {
         activePeople--
         activeBots++
      } else {
         activePeople++
         activeBots--
      }
   }

   const localIndex = Array.prototype.indexOf.call(option.parentElement.children, option)
   if (localIndex === -1) { throw new ReferenceError('No player is selected!??') }

   players[playerIndex] = new PlayerReference(type, localIndex)
   currentGame.playBots()
   return ['Done! Player changed: ', players[playerIndex]]
}

// this = <input>
async function changeName () {
   const correctIndex = this.parentElement.id[13] - 1
   const name = this.value.length ? this.value : this.placeholder
   people[correctIndex].name = name

   for (const select of ELEMENTS.playerSelects) { select.firstElementChild.children[correctIndex].text = name }
   return `Done: Name changed to ${name}`
}

// this = <input>
async function enablePerson (fromEnablePeople = false) {
   // MAX_PLAYERS_REACHED and EVERYONEs_ENABLED both fit...
   if (activePeople === 4) { ERRORS.EVERYONEs_ENABLED.rethrow() }
   activePeople++

   if (!fromEnablePeople) { ELEMENTS.numPeopleSelect.selectedIndex++ }

   const personIndex = this.parentElement.innerText[10] - 1
   people[personIndex].disabled = false

   for (const select of ELEMENTS.playerSelects) { select.firstElementChild.children[personIndex].disabled = false }

   this.disabled = false
   this.parentElement.parentElement.children[1].disabled = true
   this.parentElement.parentElement.children[2].disabled = false
   return `Done: Person at index ${personIndex} enabled.`
}

// Bug, probably feature: Player not changed when disabled
async function disablePerson (fromDisablePeople = false) {
   if (activePeople === 0) { ERRORS.NO_ONEs_ENABLED.rethrow() }
   activePeople--

   if (!fromDisablePeople) { ELEMENTS.numPeopleSelect.selectedIndex-- }

   const personIndex = this.parentElement.id[13] - 1
   people[personIndex].disabled = true

   for (const select of ELEMENTS.playerSelects) { select.firstElementChild.children[personIndex].disabled = true }

   this.disabled = true
   this.parentElement.parentElement.children[1].disabled = false
   this.parentElement.parentElement.children[2].disabled = true
   return `Done: Person at index ${personIndex} disabled.`
}

// num === Number(this.value), in enableOrDisablePlayers
// Will only warn about bad num in the inner button.click()s
async function enablePeople (num) {
   const clickPromises = []
   let counter = activePeople
   for (const button of ELEMENTS.enablePersonButtons) {
      if (button.disabled) { continue }
      clickPromises.push(
         enablePerson.call(button.parentElement.children[0].children[1], true)
      )

      if (++counter === num) { break }
   }

   const promiseGroup = await Promise.allSettled(clickPromises)
   for (const promise of promiseGroup) { if (promise.status === 'rejected') { throw new AggregateError(promiseGroup) } }

   if (counter !== num) { console.warn(`Counter or num isn't correct: ${counter} !== ${num}`) }
   if (activePeople !== num) { console.warn(`activePeople or num isn't correct: ${activePeople} !== ${num}`) }
   if (activePeople !== counter) { console.warn(`activePeople or counter isn't correct: ${activePeople} !== ${counter}`) }

   return promiseGroup
}

// Disables first-to-last just like enable.
async function disablePeople (num) {
   const clickPromises = []
   let counter = activePeople
   for (const button of ELEMENTS.disablePersonButtons) {
      if (button.disabled) { continue }
      clickPromises.push(
         disablePerson.call(button.parentElement.children[0].children[1], true)
      )

      if (--counter === num) { break }
   }

   const promiseGroup = await Promise.allSettled(clickPromises)
   for (const promise of promiseGroup) { if (promise.status === 'rejected') { throw new AggregateError(promiseGroup) } }

   if (counter !== num) { console.warn(`Counter or num isn't correct: ${counter} !== ${num}`) }
   if (activePeople !== num) { console.warn(`activePeople or num isn't correct: ${activePeople} !== ${num}`) }
   if (activePeople !== counter) { console.warn(`activePeople or counter isn't correct: ${activePeople} !== ${counter}`) }

   return promiseGroup
}

// this = <select disabled>
async function enablePlayer (fromEnablePlayers = false) {
   if (activePlayers === 4) { ERRORS.MAX_PLAYERS_REACHED.rethrow() }

   const playerIndex = this.parentElement.id[8] - 1
   if (playerIndex !== players.length) { return await ELEMENTS.enablePlayerButtons[playerIndex].click() }

   if (!fromEnablePlayers) { ELEMENTS.numPlayersSelect.selectedIndex++ }
   activePlayers++
   activeBots++

   this.disabled = false
   this.parentElement.nextElementSibling.disabled = true
   this.parentElement.nextElementSibling.nextElementSibling.disabled = false

   // Dummy player
   // Should always be right after the enabled players.
   this.selectedIndex = 4
   players.push(new PlayerReference('bot', 0))
   this.dispatchEvent(new Event('change')) // triggers changePlayer; *changes* new player

   if (currentGame.toMove === 0) {
      currentGame.toMove = players.length - 1
      currentGame.turn--
   }

   return 'Done! Enabled player (random_move for safety)'
}

// Min players: !1 (apparently it's 0)
// this = <input (not:disabled)>
async function disablePlayer (fromDisablePlayers = false) {
   if (activePlayers === 0) {
      ERRORS.NO_ONEs_ENABLED.rethrow()
   } else if (activePlayers < GameBase.MIN_PLAYERS) {
      return notice("Minimum players reached - can't disable more players")
   }

   const option = this.selectedOptions[0]

   // The next player is more useful - so no index correction here.
   const playerIndexPlusOne = this.parentElement.id[8]
   if (playerIndexPlusOne < players.length) {
      const previousIndex = this.selectedIndex
      this.selectedIndex = ELEMENTS.playerSelects[playerIndexPlusOne].selectedIndex
      ELEMENTS.playerSelects[playerIndexPlusOne].selectedIndex = previousIndex

      this.dispatchEvent(new Event('change'))
      ELEMENTS.playerSelects[playerIndexPlusOne].dispatchEvent(new Event('change'))

      return await disablePlayer.call(ELEMENTS.playerSelects[playerIndexPlusOne], true)
   } else {
      this.disabled = true
      this.parentElement.nextElementSibling.disabled = false
      this.parentElement.nextElementSibling.nextElementSibling.disabled = true
      players.pop()

      activePlayers--
      ELEMENTS.numPlayersSelect.selectedIndex--

      // <optgroup> label
      if (option.parentElement.label === 'Bots') {
         activeBots--
      } else {
         activePeople--
      }

      if (currentGame.toMove === playerIndexPlusOne - 1) {
         currentGame.toMove = 0
         currentGame.turn++
      }

      currentGame.playBots()
      return ['Done! Player disabled']
   }
}

// Number!
async function enablePlayers (num) {
   const clickPromises = []
   let counter = activePlayers
   for (const button of ELEMENTS.enablePlayerButtons) {
      if (button.disabled) { continue }
      clickPromises.push(
         enablePlayer.call(button.parentElement.children[0].children[1], true)
      )

      if (++counter === num) { break }
   }

   const promiseGroup = await Promise.allSettled(clickPromises)
   for (const promise of promiseGroup) { if (promise.status === 'rejected') { throw new AggregateError(promiseGroup) } }

   if (counter !== num) { console.warn(`Counter or num isn't correct: ${counter} !== ${num}`) }
   if (activePlayers !== num) { console.warn(`activePlayers or num isn't correct: ${activePlayers} !== ${num}`) }
   if (activePlayers !== counter) { console.warn(`activePlayers or counter isn't correct: ${activePlayers} !== ${counter}`) }

   return promiseGroup
}

async function disablePlayers (num) {
   const clickPromises = []
   let counter = activePlayers
   for (const button of ELEMENTS.disablePlayerButtons) {
      if (button.disabled) { continue }
      clickPromises.push(
         disablePlayer.call(button.parentElement.children[0].children[1], true)
      )

      if (--counter === num) { break }
   }

   const promiseGroup = await Promise.allSettled(clickPromises)
   for (const promise of promiseGroup) { if (promise.status === 'rejected') { throw new AggregateError(promiseGroup) } }

   if (counter !== num) { console.warn(`Counter or num isn't correct: ${counter} !== ${num}`) }
   if (activePlayers !== num) { console.warn(`activePlayers or num isn't correct: ${activePlayers} !== ${num}`) }
   if (activePlayers !== counter) { console.warn(`activePlayers or counter isn't correct: ${activePlayers} !== ${counter}`) }

   return promiseGroup
}

/*
Types: human, bot

*/
