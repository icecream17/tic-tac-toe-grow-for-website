// This is licensed under the Apache License 2.0,
// see https://github.com/icecream17/tic-tac-toe-grow-for-website/blob/main/LICENSE

"use strict";

// The log levels used are:
// verbose, by console.debug
// info, by console.info or console.log

/**
 * Used by async functions to "wait" for some time.
 *
 * @param {number} ms - How many milliseconds to wait.
 * @return {Promise<"Done!">}
 * @example
 *
 *    pause(1000); // Wait 1000ms, or 1 second.
 */
async function pause(ms) {
   return await new Promise(resolve => setTimeout(resolve, ms, "Done!"));
}

/**
 * This is not a [native code] function.
 * Checks if the value of <code>this</code> array is equal to the values of <code>arr</code>. 
 *
 * @param {*[]} arr - An array to check
 * @return {boolean} - Whether the two arrays' values are equal
 * @example
 *
 *    [2, 3].valuesEqual([2, 3]) // true
 *    [2, 3].valuesEqual([2, 4]) // false
 *    [2, 4, [5]].valuesEqual([2, 4, [5]]) // true
 *    [2, 4, [5]].valuesEqual([2, 4, 5]) // false
 */
Array.prototype.valuesEqual = function valuesEqual(arr) {
   if (!Array.isArray(arr) || this.length !== arr.length)
      return false;
   
   for (let i = 0; i < this.length; i++)
      if (this[i] !== arr[i])
         if (!Array.isArray(this[i]) || !Array.isArray(arr[i]))
            return false
         else if (!this[i].valuesEqual(arr[i]))
            return false;
   return true;
}

/** Represents an explicit and somewhat anticipated error */
class CustomError extends Error {
   /** @returns {string} - The error constructor name. */
   get name() { return this.constructor.name } // For ease of maintenance
}

/** Represents an error involving an element. */
class ElementError extends CustomError {
   /**
    * @param {string} [message] - The error message to display in the console when thrown
    * @param {HTMLElement} [element=HTMLUnknownElement] - The element that was involved in the error
    */
   constructor (message, element = document.createElement('HTMLUnknownElement')) {
      super(message);
      this.element = element;
   }
}

class NothingDisabledError extends CustomError {
   constructor (noun = "Nothing", plural = `${noun}s`, message = `Cannot enable ${noun} since all ${plural} are already enabled.`) {
      super(message);
   }
}

class NothingEnabledError extends CustomError {
   constructor (noun = "Nothing", plural = `${noun}s`, message = `Cannot disable ${noun} since all ${plural} are already disabled.`) {
      super(message);
   }
}

// params = (string, string)
// do not pass "null" into condition
class DisabledError extends CustomError {
   constructor (noun, condition = '') {
      if (condition.length !== 0) condition = ` and ${condition}`;

      super(`${noun} is disabled${condition}.`);
   }
}

class BotIsDisabledError extends DisabledError {
   constructor (bot) {
      super(bot.name, 'cannot play');
      this.bot = bot;
   }
}

class ElementIsDisabledError extends DisabledError {
   constructor (element, message = "shouldn't be changed") {
      super(element.tagName, message);
      this.element = element;
   }
}

class ElementAlreadyError extends ElementError {
   constructor (element, isAlreadyWhat) {
      super(`${element.tagName} element is already ${isAlreadyWhat}`, element);
   }
}

class ElementIsAlreadyDisabledError extends ElementAlreadyError {
   constructor (element) {
      super(element, "disabled");
   }
}

class ElementIsAlreadyEnabledError extends ElementAlreadyError {
   constructor (element) {
      super(element, "enabled");
   }
}

// When an internal value is wrong
class InvalidValueError extends CustomError {
   constructor (valueName = "value identifier unprovided", message = `Invalid internal value! (${valueName})`) {
      super(message);
   }
}

class MaxValueError extends InvalidValueError {
   constructor (message = "Max value reached") {
      super(message);
   }
}

class SameValuesError extends CustomError {
   constructor (message = "Some values are the same when they shouldn't be") {
      super(message);
   }
}

class DidntChangeError extends SameValuesError {
   constructor (message = 'Something "changed" to the same value') {
      super(message);
   }
}

// When the user does something the user isn't supposed to
class EvilPlayerError extends CustomError {
   constructor (message = 'hmmph') {
      super(message);
   }
}

// Only for constant non-default errors
const ERRORS = {
   SQUARE_NOT_UPDATED: new InvalidValueError("square", "AAA WHAT!????"),
   INVALID_MOVE_FINISH: new InvalidValueError("moveFinish"),
   IMPOSSIBLE_LAST_MOVE: new ReferenceError("Last move was not an option...?"),
   MAX_PLAYERS_REACHED: new MaxValueError("Max players reached"),
   EVERYONEs_ENABLED: new NothingDisabledError("person", "people"),
   NO_ONEs_ENABLED: new NothingEnabledError("person", "people"),
   EVIL_CLICK: new EvilPlayerError("Hey, you're not supposed to click that"),
   EVIL_CHANGE: new EvilPlayerError("How did you do that"),
};
const NOT_DONE_YET = "This feature is not finished yet. So it doesn't work";

class Position {
   constructor (x, y) {
      this.x = x;
      this.y = y;
   }

   /** Returns the manhattan distance from another position */
   distance(position) {
      return Math.abs(this.x - position.x) + Math.abs(this.y - position.y);
   }

   /** Method returning a shallow copy of the position */
   copy() {
      return new Position(this.x, this.y);
   }
}

class Step {
   constructor (vx, vy) {
      this.vx = vx;
      this.vy = vy;
   }
}

class Cell extends Position {
   constructor (value, x, y) {
      super(x, y);
      this.value = value;
      this.win = false; // Idea: setter errors when value is '' or ' '
      this.moveIndex = null; // Index when a move is played on that square
   }
}

class Move extends Position {
   // "Move" is highly bound to the class "Game".
   // super(newXY.x, newXY.y);
   // this.index = game.moveHistory.length
   constructor (oldXY, newXY, player, game = currentGame) {
      super(newXY.x, newXY.y);
      this.game = game;
      this.index = game.moveHistory.length; // must be true
      this.player = player;
      this.positionAtLastUpdate = new Position(this.x, this.y);
      this.lastUpdateIndex = this.index;

      this.originalPosition = oldXY; // No board update
   }

   // Get the gameState on demand instead of using unneccesary storage
   get gameState() {
      return this.game.getGameStateAt(this.index);
   }

   /**
    * The board might've updated, and gotten a new row to the left for example.
    * So this getter method gets the updated position of a move.
    */
   get correspondingPosition() {
      for (; this.lastUpdateIndex < this.game.moveHistory.length; this.lastUpdateIndex++) {
         const nextMove = this.game.moveHistory[this.lastUpdateIndex].originalPosition;
         if (nextMove.x === 0) this.positionAtLastUpdate.x++;
         if (nextMove.y === 0) this.positionAtLastUpdate.y++;
      }
      return this.positionAtLastUpdate.copy();
   }

   updatedDistance(position) {
      let updatedPosition = this.correspondingPosition;
      return Math.abs(updatedPosition.x - position.x)
           + Math.abs(updatedPosition.y - position.y);
   }
}

class GameBase {
   #MAX_LENGTH = 511;
   #MAX_TURNS = 314;
   static INITIAL_MAX_LENGTH = 511;
   static INITIAL_MAX_TURNS = 314;

   constructor () {
      this.turn = 0; /** Starts at 0 */
      this.ply = 0;
      this.toMove = 0; // index in player array
      this.result = null;
      this.winners = [];

      this.board = [
         [new Cell(' ', 0, 0), new Cell(' ', 0, 1), new Cell(' ', 0, 2)],
         [new Cell(' ', 1, 0), new Cell(' ', 1, 1), new Cell(' ', 1, 2)],
         [new Cell(' ', 2, 0), new Cell(' ', 2, 1), new Cell(' ', 2, 2)]
      ]; // WARNING: this.board[y][x]
      this.board.width = 3;
      this.board.height = 3; // same as this.board.length

      this.moveHistory = [];
   }

   // NOTE: No value validation.
   set MAX_LENGTH(value) { this.#MAX_LENGTH = value }
   get MAX_LENGTH() { return this.#MAX_LENGTH }
   set MAX_TURNS(value) { this.#MAX_TURNS = value }
   get MAX_TURNS() { return this.#MAX_TURNS }

   setCell(x, y, value) {
      this.board[y][x] = new Cell(value, x, y);
   }

   // No update function provided!

   updateBoard(x, y) {
      // Possible bug in the future, the else ifs assume that the
      // first cell is not the same as the last cell, which would be untrue if
      // the board was somehow one cell big.

      // Since we grow the board down at the 4 ifs,
      // the (i === x ? ' ' : '') is redundant
      if (y === 0) {
         this.board.unshift([]);
         for (let i = 0; i < this.board.width; i++)
            this.board[0].push(
               new Cell(i === x ? ' ' : '', i, 0)
            );
         this.board.height++; y++;
      } else if (y === this.board.height - 1) {
         this.board.push([]);
         this.board.height++;
         for (let i = 0; i < this.board.width; i++)
            this.board[this.board.height - 1].push(
               new Cell(i === x ? ' ' : '', i, this.board.height - 1)
            );
      }

      if (x === 0) {
         for (let i = 0; i < this.board.length; i++)
            this.board[i].unshift(
               new Cell(i === y ? ' ' : '', i, 0)
            );
         this.board.width++; x++;
      } else if (x === this.board.width - 1) {
         for (let i = 0; i < this.board.length; i++)
            this.board[i].push(
               new Cell(i === y ? ' ' : '', i, this.board.width)
            );
         this.board.width++;
      }


      if (this.board[y - 1][x].value === '') this.setCell(x, y - 1, ' ');
      if (this.board[y + 1][x].value === '') this.setCell(x, y + 1, ' ');
      if (this.board[y][x - 1].value === '') this.setCell(x - 1, y, ' ');
      if (this.board[y][x + 1].value === '') this.setCell(x + 1, y, ' ');

      this.board[y][x] = new Cell(PLAYER_CHARS[this.toMove], x, y);
      this.board[y][x].moveIndex = this.moveHistory.length;

      for (let y2 = 0; y2 < this.board.length; y2++)
         for (let x2 = 0; x2 < this.board.width; x2++) {
            this.board[y2][x2].y = y2;
            this.board[y2][x2].x = x2;
         }

      return this.board[y][x];
   }


   updateGameEnd(result, lastX, lastY) {
      // Even if a win happens after a draw, or a draw happens after a win,
      // or even a win happens after a win, *only the first result counts*.
      this.result ??= result[0];

      // Converted from an "if, else if, else" statement.
      switch (result[0]) {
         case "win":
            {
               notice("WINNNN", result);
               for (let cell of result[1].flat().concat(this.board[lastY][lastX]))
                  cell.win = true;

               let winArray = [this.toMove, PLAYER_NAMES[this.toMove], players[this.toMove].player];
               if (this.winners.every(array => !array.valuesEqual(winArray)))
                  this.winners.push(winArray);
            }
            break;
         case "draw":
            notice(`*gasp*! Draw!\n${result[1]}`, result);
            break;
         default:
            throw ERRORS.INVALID_MOVE_FINISH;
      }
   }

   checkGameEnd(x, y) {
      let win = this.checkWin(x, y);
      if (win) return ["win", win];

      // In this case, a switch statement would be worse.
      if (this.board.width > 7 * this.board.height)
         return ["draw", "width is 7 times the height"];
      else if (this.board.height > 7 * this.board.width)
         return ["draw", "height is 7 times the width"];
      else if (this.turn >= this.MAX_TURNS)
         return ["draw", `max turns reached (${Game.MAX_TURNS})`];
      else if (this.board.width >= this.MAX_LENGTH)
         return ["draw", `max length reached by width (${Game.MAX_LENGTH})`];
      else if (this.board.height >= this.MAX_LENGTH)
         return ["draw", `max length reached by height (${Game.MAX_LENGTH})`];
      else
         return false;
   }

   checkWin(x, y) {
      const playerValue = this.board[y][x].value;
      let wins = [];
      let orthogonal = [[], [], [], []];
      let diagonal = [[], [], [], []];

      // Arrow function so that "this" is not undefined
      const goDiagonal = (x2, y2, step) => {
         let diag = [this.board[y2][x2]];
         let currentPos = new Position(x2, y2);

         // eslint-disable-next-line no-constant-condition
         while (true) {
            currentPos.x += step.vx;
            currentPos.y += step.vy;
            let square = this.board[currentPos.y]?.[currentPos.x];

            if (square?.value !== playerValue) break;
            diag.push(square);
         }

         return diag;
      }

      for (let i = 0; i < 4; i++) {
         const orthogonalStep = [
            new Step(-1, 0),
            new Step(1, 0),
            new Step(0, 1),
            new Step(0, -1),
         ][i];

         const diagonalStep = [
            new Step(1, 1),
            new Step(1, -1),
            new Step(-1, 1),
            new Step(-1, -1)
         ][i];

         orthogonal[i] = goDiagonal(x, y, orthogonalStep);
         diagonal[i] = goDiagonal(x, y, diagonalStep);
      }

      // good good good n good good good
      // n 1 1 1 n 2 2 2
      function sevenNArow(oneDirection, oppositeDirection) {
         if (oneDirection.length + oppositeDirection.length >= 8)
            return oneDirection.slice(1).concat(...oppositeDirection);
         else
            return false;
      }

      function checkMark(side1, side2) {
         if (
            side1.length >= 4 && side2.length >= 2 ||
            side2.length >= 4 && side1.length >= 2
         )
            return side1.slice(1).concat(...side2);
         else
            return false;
      }

      function isValidCheckmark(side1, side2) {
         return (side1.length >= 2 && side2.length >= 4) ||
                (side1.length >= 4 && side2.length >= 2);
      }

      const sevenChecks = [
         sevenNArow(orthogonal[0], orthogonal[1]),
         sevenNArow(orthogonal[2], orthogonal[3]),
         sevenNArow(diagonal[0], diagonal[3]),
         sevenNArow(diagonal[1], diagonal[2])
      ];

      for (let sevenNArowCheck of sevenChecks)
         if (sevenNArowCheck) wins.push(sevenNArowCheck);

      const rightAngleMarkChecks = [
         checkMark(diagonal[0], diagonal[1]),
         checkMark(diagonal[0], diagonal[2]),
         checkMark(diagonal[3], diagonal[1]),
         checkMark(diagonal[3], diagonal[2]),
      ];

      for (let markCheck of rightAngleMarkChecks)
         if (markCheck) wins.push(markCheck);


      // arrow function in order to access "this"
      // arguments = diagonal, oppositeDiagonal, perpendicularStep, oppositePerpendicularStep
      const checkmarks = (diag, oppDiag, perpStep, oppPerpStep) => {
         // The way the diags work:
         // above, the squares are pushed onto the array, *away* from the xy.
         // So the diag arrays' first elements are the ones in the diag closer to the xy
         let newWins = [];

         // The checkmarks are made of the opposite diagonal,
         // plus this diagonal (minus the shared cell), which make one big side,
         // then the other perpendicular sides.
         let currBase = [...oppDiag.slice(1), diag[0]]; // Reordering cells
         for (let square of diag.slice(1)) {
            currBase.push(square);
            let perpDiag = goDiagonal(square.x, square.y, perpStep);
            let oppPerpDiag = goDiagonal(square.x, square.y, oppPerpStep);
            if (isValidCheckmark(currBase, perpDiag))
               newWins.push([...currBase, ...perpDiag.slice(1)]);
            if (isValidCheckmark(currBase, oppPerpDiag))
               newWins.push([...currBase, ...oppPerpDiag.slice(1)]);
         }

         currBase = [...diag.slice(1), diag[0]];
         for (let square of oppDiag.slice(1)) {
            currBase.push(square);
            let perpDiag = goDiagonal(square.x, square.y, perpStep);
            let oppPerpDiag = goDiagonal(square.x, square.y, oppPerpStep);
            if (isValidCheckmark(currBase, perpDiag))
               newWins.push([...currBase, ...perpDiag.slice(1)]);
            if (isValidCheckmark(currBase, oppPerpDiag))
               newWins.push([...currBase, ...oppPerpDiag.slice(1)]);
         }

         return newWins;
      }

      wins.push(...checkmarks(diagonal[0], diagonal[3], new Step(1, -1), new Step(-1, 1)));
      wins.push(...checkmarks(diagonal[1], diagonal[2], new Step(1, 1), new Step(-1, -1)));

      return wins.length ? wins : false; // If there is a win return wins
   }


   getMoves() {
      let moves = [];
      for (let y = 0; y < this.board.height; y++)
         for (let x = 0; x < this.board.width; x++)
            if (this.board[y][x].value === ' ')
               moves.push(new Position(x, y));
      return moves;
   }

   // Adds padding to left and right
   getAscii() {
      let ascii = `+-${'-'.repeat(this.board.width)}-+\n`;
      for (let y = 0; y < this.board.length; y++) {
         ascii += '| ';
         for (let x = 0; x < this.board.width; x++)
            if (this.board[y][x].value === '') ascii += ' ';
            else if (this.board[y][x].value === ' ') ascii += '.';
            else ascii += this.board[y][x].value;
         ascii += ' |\n';
      }
      return (ascii += `+-${'-'.repeat(this.board.width)}-+`);
   }

   logAscii(verbose) {
      let ascii = `%c+%c-${'-'.repeat(this.board.width)}-%c+\n`;
      let css = [
         'color:white',
         'background-color:gray;color:gray',
         'color:white'
      ];

      for (let y = 0; y < this.board.length; y++) {
         ascii += '%c|%c ';
         css.push('color:white', 'background-color:gray');

         for (let x = 0; x < this.board.width; x++) {
            let char = this.board[y][x].value;
            ascii += '%c'
            if (char === '') {
               ascii += ' ';
               css.push('background-color:gray');
            } else if (char === ' ') {
               ascii += '.';
               css.push('color:white');
            } else if (PLAYER_CHARS.includes(char)) {
               ascii += char;
               css.push(
                  "color:"
                  + ['red', 'blue', 'green', 'orange', 'purple'][PLAYER_CHARS.indexOf(char)]
                  + (this.board[y][x].win ? ';background-color:#CFC' : '')
               );
            }
         }

         ascii += '%c %c|\n';
         css.push('background-color:gray', 'color:white');
      }
      ascii += `%c+%c-${'-'.repeat(this.board.width)}-%c+\n`;
      css.push(
         'color:white',
         'background-color:gray;color:gray',
         'color:white'
      )

      if (verbose) console.debug(ascii, ...css);
      else console.log(ascii, ...css);
   }


}

class GameState extends GameBase {
   constructor (game) {
      super();
      this.game = game;
   }

   doMove (move) {
      let {x, y} = move.originalPosition;
      if (this.board[y][x].value !== ' ')
         throw ERRORS.SQUARE_NOT_UPDATED;

      // () To prevent parsing as a block
      ({x, y} = Game.prototype.updateBoard.call(this, x, y));

      let moveFinish = Game.prototype.checkGameEnd.call(this, x, y);
      if (moveFinish !== false) Game.prototype.updateGameEnd.call(this, moveFinish, x, y);

      this.moveHistory.push(move);
      this.ply++;
      this.toMove = (this.toMove + 1) % players.length;
      if (this.toMove === 0) this.turn++;
   }

   get originalMoves() {
      const moves = [];
      for (let y = 0; y < this.board.height; y++)
         for (let x = 0; x < this.board.width; x++)
            if (this.board[y][x].value === ' ')
               moves.push(new Position(x, y));
      return moves;
   }

   get correspondingMoves() {
      let moves = this.originalMoves;
      for (let move of moves)
         for (
            let index = this.moveHistory.length;
            index < this.game.moveHistory.length;
            index++
         ) {
            const nextMove = this.game.moveHistory[index].originalPosition;
            if (nextMove.x === 0) move.x++;
            if (nextMove.y === 0) move.y++;
         }
      return moves;
   }

}

class Game extends GameBase {
   constructor () {
      super();

      this.visual = [];
      this.visual.offset = new Position(0, 0);
      this.visualStart();
   }

   visualStart() {
      // the top-left of the board is 0, 0
      // second row is 1, 0
      // third row, seventh column is 3, 7

      for (let y = 0; y < this.board.length; y++)
         for (let x = 0; x < this.board.width; x++)
            if (this.board[y][x].value !== '')
               ELEMENTS.getSquare(
                  this.visual.offset.x + x,
                  this.visual.offset.y + y
               ).className = 'board';
   }

   play(x, y) {
      this.update(x, y);
      this.playBots();
      this.logAscii(true);
   }

   async playBots() {
      if (players[this.toMove].type === "bot") {
         await pause(200);
         this.doBotMove();
      }

      this.logAscii(true);
   }

   update(x, y) {
      console.debug(`(update) move: ${x} ${y}`);

      if (this.board[y][x].value !== ' ')
         throw ERRORS.SQUARE_NOT_UPDATED;

      const oldPosition = {x, y};
      ({x, y} = this.updateBoard(x, y));

      let moveFinish = this.checkGameEnd(x, y);
      if (moveFinish !== false) this.updateGameEnd(moveFinish, x, y);

      this.moveHistory.push(new Move(oldPosition, {x, y}, players[this.toMove], this));
      players[this.toMove].lastMove = this.moveHistory[this.moveHistory.length - 1];

      // updateVisual must go after setting lastMove but before setting toMove
      if (this === currentGame) this.updateVisual();

      this.ply++;
      this.toMove = (this.toMove + 1) % players.length;
      if (this.toMove === 0) this.turn++;

      // But this must go after setting turn
      if (this === currentGame) this.updateVisualStats();

      console.debug(`(update) move: ${x} ${y}, moveFinish: ${moveFinish}`);
   }

   updateVisualStats() {
      ELEMENTS.statsParagraph.innerText =
`Width: ${this.board.width}
Height: ${this.board.height}
Turns: ${this.turn}`;
   }

   // Same as visualStart really
   updateVisual() {
      for (let y = 0; y < 20; y++)
         for (let x = 0; x < 20; x++) {
            let button = ELEMENTS.getSquare(x, y);
            let cell = this.board?.[y - this.visual.offset.y]?.[x - this.visual.offset.x];

            // undefined or empty string
            button.classList.remove("board", "win");
            button.style.removeProperty("border-color");
            button.style.removeProperty("background-color");
            button.style.removeProperty("background-image");

            // Assumes (cell === undefined || cell.value !== undefined)
            if (cell === undefined || cell.value === '') continue;
            else button.classList.add('board');

            if (cell.value !== ' ') {
               let playerIndex = PLAYER_CHARS.indexOf(cell.value);
               if (playerIndex === -1 && !cell.win)
                  button.style.backgroundColor = "red";
               else
                  button.style.backgroundImage = `url("${player_assets[playerIndex]}")`;


               button.classList.add("board");
               if (cell.win)
                  button.classList.add("win");
               else if (players?.[playerIndex].lastMove?.index === cell.moveIndex)
                  button.style.borderColor = PLAYER_BORDERS[playerIndex];
            }
         }
      // Outer for doesn't need brackets
   }

   // Gets the game state *before* a move is played
   // So if moveIndex was 0, it would get the starting position
   getGameStateAt(moveIndex) {
      let gameCopy = new GameState(this);
      for (let i = 0; i < moveIndex; i++)
         gameCopy.doMove(this.moveHistory[i]);
      
      return gameCopy;
   }

   doBotMove() {
      if (players[this.toMove].player.type === "bot")
         players[this.toMove].player.play();
      else
         console.info("Player must've changed into a human");
   }

}

function handleClick(x, y) {
   console.debug("Click!", x, y);
   x -= currentGame.visual.offset.x;
   y -= currentGame.visual.offset.y;

   let square = currentGame.board?.[y]?.[x];
   if (square === undefined)
      throw ERRORS.EVIL_CLICK;

   if (players[currentGame.toMove].type === "human" && square.value === ' ')
      currentGame.play(x, y);
}

function notice(...args) {
   // TODO: do something
}

const player_assets = [
   "player_assets/x.png",
   "player_assets/o.png",
   "player_assets/triangle.png",
   "player_assets/square.png"
];

const PLAYER_CHARS = "xovn";

const PLAYER_BORDERS = [
   "red",
   "dodgerblue",
   "green",
   "#ffd74a"
];

const PLAYER_NAMES = [
   "x",
   "o",
   "triangle",
   "square",
   "pentagon"
];

const ELEMENTS = {
   container: document.getElementById('container'),
   infoElement: document.querySelector('#container aside'),
   gameDataElement: document.getElementById('gameData'),
   numPeopleSelect: document.querySelector('#personCountLabel select'),
   numPlayersSelect: document.querySelector('#playerAmountLabel select'),
   resetGameButton: document.getElementById('resetGame'),
   shifts: document.querySelectorAll('#mapControls button'),
   statsParagraph: document.getElementById('nonPlayerStats'),
   squares: [],

   getSquare(x, y) {
      return document.getElementById(`${x}-${y}`);
   },

   // {b} is unneccesary in {a b c}, the space selects all children
   // TODO: Only have a getter for non-constant elements
   usernameInputs: document.querySelectorAll('#nameFields fieldset input'),
   enablePersonButtons: document.querySelectorAll('#nameFields fieldset button.enable'),
   disablePersonButtons: document.querySelectorAll('#nameFields fieldset button.disable'),
   enablePlayerButtons: document.querySelectorAll('#choosePlayerFields button.enable'),
   disablePlayerButtons: document.querySelectorAll('#choosePlayerFields button.disable'),

   playerSelects: document.querySelectorAll('#choosePlayerFields label select'),
   getEnabledPlayerSelects() {
      return document.querySelectorAll('#choosePlayerFields label select:enabled');
   },
};

// up down left right
ELEMENTS.shifts[0].onclick = () => {
   currentGame.visual.offset.y--;
   currentGame.updateVisual();
};
ELEMENTS.shifts[1].onclick = () => {
   currentGame.visual.offset.y++;
   currentGame.updateVisual();
};
ELEMENTS.shifts[2].onclick = () => {
   currentGame.visual.offset.x--;
   currentGame.updateVisual();
};
ELEMENTS.shifts[3].onclick = () => {
   currentGame.visual.offset.x++;
   currentGame.updateVisual();
};

for (let x = 0; x < 20; x++) {
   ELEMENTS.squares[x] = [];
   for (let y = 0; y < 20; y++) {
      let element = document.createElement('button');
      ELEMENTS.squares[x].push(element);

      element.id = `${x}-${y}`;
      element.setAttribute("aria-label", `Square at ${x}-${y}`);
      element.style.gridColumn = x + 1;
      element.style.gridRow = y + 1;
      element.onclick = handleClick.bind(element, x, y);
      ELEMENTS.container.appendChild(element);
   }
}

let gameHistory = [];
let currentGame = new Game();

ELEMENTS.resetGameButton.onclick = function resetGame () {
   gameHistory.push(currentGame);
   currentGame = new Game();
   currentGame.updateVisual();
   currentGame.updateVisualStats();
}

// Assumes that the enable and disable buttons are disabled / enabled when appropriate.
// For example, the enable button should not be enabled if the element is already enabled.
// So the errors might be wrong.

// Note: <var> <input>
ELEMENTS.numPeopleSelect.onchange = function (event) {
   console.debug(EnableOrDisablePeople.call(event.target));
};
ELEMENTS.numPlayersSelect.onchange = function (event) {
   console.debug(EnableOrDisablePlayers.call(event.target));
};
for (let input of ELEMENTS.usernameInputs)
   input.onchange = function usernameChange(event) {
      if (event.target.disabled) throw new ElementIsDisabledError(event.target);
      console.debug(changeName.call(event.target));
   };
for (let button of ELEMENTS.enablePersonButtons)
   button.onclick = function (event) {
      if (event.target.disabled) throw new ElementIsAlreadyEnabledError(event.target);
      console.debug(enablePerson.call(event.target.parentElement.children[0].children[1]));
   };
for (let button of ELEMENTS.disablePersonButtons)
   button.onclick = function (event) {
      if (event.target.disabled) throw new ElementIsAlreadyDisabledError(event.target);
      console.debug(disablePerson.call(event.target.parentElement.children[0].children[1]));
   };
for (let select of ELEMENTS.playerSelects)
   select.onchange = function playerChange(event) {
      if (event.target.disabled) throw new ElementIsDisabledError(event.target);
      console.debug(changePlayer.call(event.target));
   };
for (let button of ELEMENTS.enablePlayerButtons)
   button.onclick = function (event) {
      if (event.target.disabled) throw new ElementIsAlreadyEnabledError(event.target);
      console.debug(enablePlayer.call(event.target.parentElement.children[0].children[1]));
   };
for (let button of ELEMENTS.disablePlayerButtons)
   button.onclick = function (event) {
      if (event.target.disabled) throw new ElementIsAlreadyDisabledError(event.target);
      console.debug(disablePlayer.call(event.target.parentElement.children[0].children[1]));
   };


class Player {
   constructor (type, name, disabled) {
      this.type = type;
      this.name = name;
      this.disabled = disabled;
      this.lastMove = null;
   }
}

class Human extends Player {
   constructor (name, disabled = true) {
      super("human", name, disabled);
   }
}

class Bot extends Player {
   constructor (name, mechanics, disabled = false) {
      super("bot", name, disabled);
      this.mechanics = mechanics;
   }

   play(...params) {
      if (this.disabled) throw new BotIsDisabledError(this);
      return this.mechanics.apply(currentGame, ...params);
   }
}

class PlayerReference {
   constructor (type, index) {
      if (type === "human" && people.length <= index)
         throw new ReferenceError(`Person at index ${index} doesn't exist`);
      else if (type === "bot" && bots.length <= index)
         throw new ReferenceError(`Bot at index ${index} doesn't exist`);

      this.type = type;
      this.index = index;
   }

   get player() {
      if (this.type === "human")
         return people[this.index];
      else
         return bots[this.index];
   }

   set disabled(isDisabled) {
      this.player.disabled = isDisabled;
   }

   get disabled() {
      return this.player.disabled;
   }
}

const bot_mechanics = {
   /** Chooses a random move */
   random_move() {
      const moves = this.getMoves();
      const chosen = moves[Math.floor(Math.random() * moves.length)];
      this.play(chosen.x, chosen.y);
   },
   /** Choosen the median move out of the list of moves */
   middle_index() {
      const moves = this.getMoves();
      let chosen;

      // a b c --> length: 3, index: 1
      // a b c d --> length: 4, index: 1 or 2
      if (moves.length % 2 === 1)
         chosen = moves[(moves.length - 1) / 2];
      else
         chosen = moves[
            Math.random() < 0.5
               ? moves.length / 2
               : (moves.length / 2) - 1
         ];
      this.play(chosen.x, chosen.y);
   },
   /** Copies the index of the move you just played */
   copy() {
      let moves = this.getMoves();
      let lastMove = this.moveHistory?.[this.moveHistory.length - 1];
      let positionOfLastMove = lastMove?.originalPosition;

      if (lastMove === undefined)
         bot_mechanics.random_move.apply(this);
      else {
         let indexOfLastMove = (
            lastMove.gameState
               .originalMoves
               .findIndex(
                  position => position.x === positionOfLastMove.x
                     && position.y === positionOfLastMove.y
               )
         );

         if (indexOfLastMove === -1)
            throw ERRORS.IMPOSSIBLE_LAST_MOVE;
         const chosen = moves[indexOfLastMove];
         this.play(chosen.x, chosen.y);
      }
   },
   /** Tries to avoid the previous moves */
   avoider() {
      let moves = this.getMoves();
      let best_moves = [-Infinity, []]
      for (let move of moves) {
         let score = 0;
         for (let historicalMove of this.moveHistory)
            score += historicalMove.updatedDistance(move); // More distance
         if (score === best_moves[0]) best_moves[1].push(move);
         else if (score > best_moves[0]) best_moves = [score, [move]];
      }

      const chosen = best_moves[1][Math.floor(Math.random() * best_moves[1].length)];
      this.play(chosen.x, chosen.y);
   },
   /** Makes the previous moves uncomfortable */
   closer() {
      let moves = this.getMoves();
      let best_moves = [-Infinity, []];
      for (let move of moves) {
         let score = 100_000; // Positive number --> Easier score tracking
         for (let historicalMove of this.moveHistory) {
            score -= historicalMove.updatedDistance(move); // Less distance
            if (score < best_moves[0]) break;
         }
         if (score === best_moves[0]) best_moves[1].push(move);
         else if (score > best_moves[0]) best_moves = [score, [move]];
      }

      const chosen = best_moves[1][Math.floor(Math.random() * best_moves[1].length)];
      this.play(chosen.x, chosen.y);
   },
   /** Makes moves on the diagonal containing the corresponding square of 0, 0 */
   firstDiagonal() {
      let positionOnDiagonal;
      if (this.moveHistory.length) {
         let move = this.moveHistory[0];
         positionOnDiagonal = move.correspondingPosition;

         if ((move.x + move.y) % 2 === 1) positionOnDiagonal.x++;
      } else positionOnDiagonal = new Position(0, 0);

      let moves = this.getMoves().filter(move => (
         (positionOnDiagonal.x + positionOnDiagonal.y + move.x + move.y) % 2 === 0
      ));
      if (moves.length === 0)
         bot_mechanics.random_move.apply(this);
      else {
         const chosen = moves[Math.floor(Math.random() * moves.length)];
         this.play(chosen.x, chosen.y);
      }
   },
};


let activeBots = 1;
let activePeople = 1;
let activePlayers = 2;

let people = [
   new Human("Person 1"),
   new Human("Person 2"),
   new Human("Person 3"),
   new Human("Person 4")
];

let bots = [];
for (let key of Object.keys(bot_mechanics)) {
   let newBot = new Bot(key, bot_mechanics[key]);
   bots.push(newBot);
   bots[key] = newBot;
}

let players = [
   new PlayerReference("human", 0),
   new PlayerReference("bot", 0)
];


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

// this = #playerAmountLabel <select>
async function EnableOrDisablePlayers() {
   if (this.value < activePlayers)
      return await disablePlayers(Number(this.value));
   else if (this.value > activePlayers)
      return await enablePlayers(Number(this.value));
   else
      throw new DidntChangeError();
}

// this = #personCountLabel <select>
async function EnableOrDisablePeople() {
   if (this.value < activePeople)
      return await disablePeople(Number(this.value));
   else if (this.value > activePeople)
      return await enablePeople(Number(this.value));
   else
      throw new DidntChangeError();
}

// this = <select>
async function changePlayer() {
   let option = this.selectedOptions[0];
   option.selected = true;

   let type = option.parentElement.label === "Bots" ? "bot" : "human"; // <optgroup> label

   let playerIndex = this.parentElement.id[8] - 1;
   if (players[playerIndex].type !== type)
      if (type === "bot") {
         activePeople--;
         activeBots++;
      } else {
         activePeople++;
         activeBots--;
      }

   let localIndex = Array.prototype.indexOf.call(option.parentElement.children, option);
   if (localIndex === -1) throw ReferenceError("No player is selected!??");

   players[playerIndex] = new PlayerReference(type, localIndex);
   currentGame.playBots();
   return ["Done! Player changed: ", players[playerIndex]];
}

// this = <input>
async function changeName() {
   let correctIndex = this.parentElement.id[13] - 1;
   let name = this.value.length ? this.value : this.placeholder;
   people[correctIndex].name = name;

   for (let select of ELEMENTS.playerSelects)
      select.firstElementChild.children[correctIndex].text = name;
   return `Done: Name changed to ${name}`;
}

// this = <input>
async function enablePerson() {
   // MAX_PLAYERS_REACHED and EVERYONEs_ENABLED both fit...
   if (activePeople === 4) throw ERRORS.EVERYONEs_ENABLED;
   activePeople++; ELEMENTS.numPeopleSelect.selectedIndex++;

   const personIndex = this.parentElement.innerText[10] - 1;
   people[personIndex].disabled = false;

   for (let select of ELEMENTS.playerSelects)
      select.firstElementChild.children[personIndex].disabled = false;

   this.disabled = false;
   this.parentElement.parentElement.children[1].disabled = true;
   this.parentElement.parentElement.children[2].disabled = false;
   return `Done: Person at index ${personIndex} enabled.`;
}


// Bug, probably feature: Player not changed when disabled
async function disablePerson() {
   if (activePeople === 0) throw ERRORS.NO_ONEs_ENABLED;
   activePeople--; ELEMENTS.numPeopleSelect.selectedIndex--;

   const personIndex = this.parentElement.id[13] - 1;
   people[personIndex].disabled = true;

   for (let select of ELEMENTS.playerSelects)
      select.firstElementChild.children[personIndex].disabled = true;

   this.disabled = true;
   this.parentElement.parentElement.children[1].disabled = false;
   this.parentElement.parentElement.children[2].disabled = true;
   return `Done: Person at index ${personIndex} disabled.`;
}

// num === Number(this.value), in enableOrDisablePlayers
// Will only warn about bad num in the inner button.click()s
async function enablePeople(num) {
   let clickPromises = [];
   let counter = activePeople;
   for (let button of ELEMENTS.enablePersonButtons) {
      if (button.disabled) continue;
      clickPromises.push(enablePerson.call(button.parentElement.children[0].children[1]));
      
      if (++counter === num) break;
   }

   let promiseGroup = await Promise.allSettled(clickPromises);
   for (let promise of promiseGroup)
      if (promise.status === 'rejected') throw promiseGroup;

   if (counter !== num)
      console.warn(`Failed to enable the correct amount: ${counter} !== ${num}`);

   return promiseGroup;
}

// Disables first-to-last just like enable.
async function disablePeople(num) {
   let clickPromises = [];
   let counter = activePeople;
   for (let button of ELEMENTS.disablePersonButtons) {
      if (button.disabled) continue;
      clickPromises.push(disablePerson.call(button.parentElement.children[0].children[1]));
      if (--counter === num) break;
   }

   let promiseGroup = await Promise.allSettled(clickPromises);
   for (let promise of promiseGroup)
      if (promise.status === 'rejected') throw promiseGroup;

   activePeople = counter;
   if (counter !== num)
      console.warn(`Failed to disable the correct amount: ${counter} !== ${num}`);

   return promiseGroup;
}

// this = <select disabled>
async function enablePlayer() {
   if (activePlayers === 4) throw ERRORS.MAX_PLAYERS_REACHED;

   let playerIndex = this.parentElement.id[8] - 1;
   if (playerIndex !== players.length)
      return await ELEMENTS.enablePlayerButtons[playerIndex].click();

   activePlayers++; ELEMENTS.numPeopleSelect.selectedIndex++;
   activeBots++;

   this.disabled = false;
   this.parentElement.nextElementSibling.disabled = true;
   this.parentElement.nextElementSibling.nextElementSibling.disabled = false;

   // Dummy player
   // Should always be right after the enabled players.
   this.selectedIndex = 4;
   players.push(new PlayerReference("bot", 0));
   this.dispatchEvent(new Event("change")); // triggers changePlayer; *changes* new player
   
   if (currentGame.toMove === 0) {
      currentGame.toMove = players.length - 1;
      currentGame.turn--;
   }

   return "Done! Enabled player (random_move for safety)";
}

// Min players: 1
// this = <input (not:disabled)>
async function disablePlayer() {
   if (activePlayers === 0) throw ERRORS.NO_ONEs_ENABLED;

   let option = this.selectedOptions[0];

   // The next player is more useful - so no index correction here.
   let playerIndexPlusOne = this.parentElement.id[8];
   if (playerIndexPlusOne < players.length) {
      let previousIndex = this.selectedIndex;
      this.selectedIndex = ELEMENTS.playerSelects[playerIndexPlusOne].selectedIndex;
      ELEMENTS.playerSelects[playerIndexPlusOne].selectedIndex = previousIndex;

      this.dispatchEvent(new Event("change"));
      ELEMENTS.playerSelects[playerIndexPlusOne].dispatchEvent(new Event("change"));

      return await ELEMENTS.disablePlayerButtons[playerIndexPlusOne].click();
   } else {
      activePlayers--;
      this.disabled = true;
      this.parentElement.nextElementSibling.disabled = false;
      this.parentElement.nextElementSibling.nextElementSibling.disabled = true;
      players.pop();

      // <optgroup> label
      if (option.parentElement.label === "Bots") activeBots--;
      else activePeople--;

      if (currentGame.toMove === playerIndexPlusOne - 1) {
         currentGame.toMove = 0;
         currentGame.turn++;
      }

      currentGame.playBots();
      return ["Done! Player disabled"];
   }
}

// Number!
async function enablePlayers(num) {
   let clickPromises = [];
   let counter = activePlayers;
   for (let button of ELEMENTS.enablePlayerButtons) {
      if (button.disabled) continue;
      clickPromises.push(enablePlayer.call(button.parentElement.children[0].children[1]));
      if (++counter === num) break;
   }

   let promiseGroup = await Promise.allSettled(clickPromises);
   for (let promise of promiseGroup)
      if (promise.status === 'rejected') throw promiseGroup;

   // eslint-disable-next-line require-atomic-updates
   // Doesn't apply in this case
   activePlayers = counter;
   if (counter !== num)
      console.warn(`Failed to enable the correct amount: ${counter} !== ${num}`);
   
   return promiseGroup;
}

async function disablePlayers(num) {
   let clickPromises = [];
   let counter = activePlayers;
   for (let button of ELEMENTS.disablePlayerButtons) {
      if (button.disabled) continue;
      clickPromises.push(disablePlayer.call(button.parentElement.children[0].children[1]));
      if (--counter === num) break;
   }

   let promiseGroup = await Promise.allSettled(clickPromises);
   for (let promise of promiseGroup)
      if (promise.status === 'rejected') throw promiseGroup;

   activePlayers = counter;
   if (counter !== num)
      console.warn(`Failed to disable the correct amount: ${counter} !== ${num}`);
   
   return promiseGroup;
}


/*
Types: human, bot


*/
