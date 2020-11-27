"use strict";

class CustomError extends Error {
   constructor (message) {
      super(message);
      Error.captureStackTrace?.(this, this.constructor);
   }

   get name() { return this.constructor.name } // For ease of maintenance
}

class NothingDisabledError extends CustomError {
   constructor (noun = "Nothing", plural, message) {
      super(message ?? `Cannot enable ${noun} since all ${plural ?? `${noun}s`} are already enabled.`);
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

class BotIsDisabledError extends CustomError {
   constructor (bot) {
      super(bot.name, 'cannot play');
      this.bot = bot;
   }
}

class ElementIsDisabledError extends CustomError {
   constructor (element, message = "shouldn't be changed") {
      super(element.tagName, message);
      this.element = element;
   }
}

// When an internal value is wrong
class InvalidValueError extends CustomError {
   constructor (valueName, message) {
      super(message ?? `${valueName ? "Some" : "The"} internal value (${valueName ?? "name not provided"}) was invalid`);
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

// Only for constant non-default errors
const ERRORS = {
   CONST_MAX_LENGTH: new TypeError("Assignment to constant property {MAX_LENGTH}"),
   CONST_MAX_TURNS: new TypeError("Assignment to constant property {MAX_TURNS}"),
   SQUARE_NOT_UPDATED: new InvalidValueError("square", "AAA WHAT!????"),
   INVALID_MOVE_FINISH: new InvalidValueError("moveFinish"),
   IMPOSSIBLE_LAST_MOVE: new ReferenceError("Last move was not an option...?"),
   MAX_PLAYERS_REACHED: new MaxValueError("Max players reached"),
   EVERYONEs_ENABLED: new NothingDisabledError("person", "people")
};

class Position {
   constructor (x, y) {
      this.x = x;
      this.y = y;
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
   // Due to the unique position of the constructor in Game.update:
      // x, y: updated
      // game.moveHistory: latest move is the one before this move
   constructor (oldXY, newXY, game = currentGame) {
      super(newXY.x, newXY.y);
      this.game = game;
      this.index = game.moveHistory.length; // must be true
      this.gameState = game.gameStates[this.index + 1];

      this.originalPosition = oldXY; // No board update
   }

   get correspondingPosition() {
      const correctPosition = new Position(this.x, this.y);

      // this.index === this.gameState.moveHistory.length
      for (let index = this.index; index < this.game.moveHistory.length; index++) {
         const nextMove = this.game.moveHistory[index].originalPosition;
         if (nextMove.x === 0) correctPosition.x++;
         if (nextMove.y === 0) correctPosition.y++;
      }
      return correctPosition;
   }
}

class GameState {
   constructor (game = currentGame) {
      this.game = game;

      this.turn = game.turn;
      this.toMove = game.toMove;
      this.result = game.result;
      this.board = [];
      this.board.width = game.board.width;
      this.board.height = game.board.height;

      for (let y = 0; y < game.board.length; y++) {
         this.board.push([]);
         for (let x = 0; x < game.board.width; x++) {
            const cell = new Cell(game.board[y][x].value, y, x);
            cell.win = game.board[y][x].win;
            this.board[y].push(cell);
         }
      }

      this.moveHistory = game.moveHistory.slice();
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

class Game {
   constructor () {
      // const - silently ignores any changes so watch out
      this.turn = 1;
      this.toMove = 0; // index in array
      this.result = null;
      this.board = [
         [new Cell(' ', 0, 0), new Cell(' ', 0, 1), new Cell(' ', 0, 2)],
         [new Cell(' ', 1, 0), new Cell(' ', 1, 1), new Cell(' ', 1, 2)],
         [new Cell(' ', 2, 0), new Cell(' ', 2, 1), new Cell(' ', 2, 2)]
      ]; // WARNING: this.board[y][x]
      this.board.width = 3;
      this.board.height = 3; // same as this.board.length

      this.visual = [];
      this.visual.offset = new Position(0, 0);
      this.visualStart();

      this.moveHistory = [];
      this.gameStates = [new GameState(this)]; // starts with the original position
   }

   // These static methods must be gotten from the class Game
   // i.e.: Game.MAX_LENGTH instead of this.MAX_LENGTH

   // TODO: Add a way to change this.
   static set MAX_LENGTH(value) { throw ERRORS.CONST_MAX_LENGTH }
   static get MAX_LENGTH() { return 511 }
   static set MAX_TURNS(value) { throw ERRORS.CONST_MAX_TURNS }
   static get MAX_TURNS() { return 292 }

   setCell(x, y, value) {
      this.board[y][x] = new Cell(value, x, y);
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

      // toMove is updated now
      if (players[this.toMove].type === "bot")
         this.doBotMove();

      this.logAscii();
   }

   update(x, y) {
      console.log('move: ', x, y);

      if (this.board[y][x].value !== ' ')
         throw ERRORS.SQUARE_NOT_UPDATED;

      const oldPosition = {x, y};
      let newXY = this.updateBoard(x, y);
      x = newXY.x;
      y = newXY.y;

      let moveFinish = this.checkGameEnd(x, y);
      if (moveFinish !== false)
         if (moveFinish[0] === "win") {
            notice("WINNNN", moveFinish);
            for (let cell of moveFinish[1].flat().concat(this.board[y][x]))
               cell.win = true;
         } else if (moveFinish[0] === "draw")
            notice(`*gasp*! Draw!\n${moveFinish[1]}`, moveFinish);
         else
            throw ERRORS.INVALID_MOVE_FINISH

      this.updateVisual();

      this.gameStates.push(new GameState(this));
      this.moveHistory.push(new Move(oldPosition, {x, y}, this));
      this.toMove = (this.toMove + 1) % players.length;

      console.log("update:", x, y, moveFinish);
   }

   updateBoard(x, y) {
      // Possible bug in the future, the else ifs assume that the
      // first cell is not the same as the last cell, which would be untrue if
      // the width or height was 1

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

   // Same as visualStart really
   updateVisual() {
      for (let y = 0; y < 20; y++)
         for (let x = 0; x < 20; x++) {
            ELEMENTS.getSquare(x, y).className = '';
            ELEMENTS.getSquare(x, y).style.background = '';
         }

      // Maybe there should be a better name for "element"
      for (let y = 0; y < this.board.height; y++)
         for (let x = 0; x < this.board.width; x++) {
            let element = ELEMENTS.getSquare(
               this.visual.offset.x + x,
               this.visual.offset.y + y
            );
            if (element === null) continue;

            let cellValue = this.board[y][x].value;
            if (cellValue === '') {
               element.className = '';
               element.style.background = '';
            } else if (cellValue === ' ') {
               element.className = 'board';
               element.style.background = '';
            } else {
               element.className = 'board';

               let whichAsset = PLAYER_CHARS.indexOf(cellValue);
               if (whichAsset === -1)
                  element.style.background = "red";
               else
                  element.style.background = (
                     `url("${player_assets[whichAsset]}")`
                  );

               if (this.board[y][x].win)
                  element.classList.add("win");
            }
         }
      // Outer for doesn't need brackets
   }

   checkGameEnd(x, y) {
      let win = this.checkWin(x, y);
      if (win) return ["win", win];

      if (this.board.width > 7 * this.board.height)
         return ["draw", "width is 7 times the height"];
      else if (this.board.height > 7 * this.board.width)
         return ["draw", "height is 7 times the width"];
      else
         return false;
   }

   checkWin(x, y) {
      const playerValue = this.board[y][x].value;
      let wins = [];
      let orthogonal = [[], [], [], []];
      let diagonal = [[], [], [], []];
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

         for (let j = 1; j < 7; j++) {
            let square = this.board[
               y + (orthogonalStep.vy * j)
            ]?.[
               x + (orthogonalStep.vx * j)
            ];

            if (square?.value !== playerValue) break;
            orthogonal[i].push(square);
         }
         for (let j = 1; j < 7; j++) {
            let square = this.board[
               y + (diagonalStep.vy * j)
            ]?.[
               x + (diagonalStep.vx * j)
            ];

            if (square?.value !== playerValue) break;
            diagonal[i].push(square);
         }
      }

      // good good good n good good good
      function sevenNArow(oneDirection, oppositeDirection) {
         if (oneDirection.length + oppositeDirection.length >= 6)
            return oneDirection.concat(...oppositeDirection);
         else
            return false;
      }

      function checkMark(side1, side2) {
         if (
            side1.length >= 3 && side2.length >= 1 ||
            side2.length >= 3 && side1.length >= 1
         )
            return side1.concat(...side2);
         else
            return false;
      }

      const sevenChecks = [
         sevenNArow(orthogonal[0], orthogonal[1]),
         sevenNArow(orthogonal[2], orthogonal[3]),
         sevenNArow(diagonal[0], diagonal[3]),
         sevenNArow(diagonal[1], diagonal[2])
      ];

      if (sevenChecks.find(check => Boolean(check)))
         wins.push(sevenChecks.find(check => Boolean(check)));

      const markChecks = [
         checkMark(diagonal[0], diagonal[1]),
         checkMark(diagonal[0], diagonal[2]),
         checkMark(diagonal[3], diagonal[1]),
         checkMark(diagonal[3], diagonal[2]),
      ];

      if (markChecks.find(check => Boolean(check)))
         wins.push(markChecks.find(check => Boolean(check)));


      // This breaks the parsing
      let moreSquares = [
         this.board[y + 1]?.[x + 3],
         this.board[y + 1]?.[x - 3],
         this.board[y + 3]?.[x + 1],
         this.board[y + 3]?.[x - 1],

         this.board[y - 1]?.[x + 3],
         this.board[y - 1]?.[x - 3],
         this.board[y - 3]?.[x + 1],
         this.board[y - 3]?.[x - 1],

         this.board[y + 2]?.[x + 4],
         this.board[y + 2]?.[x - 4],
         this.board[y + 4]?.[x + 2],
         this.board[y + 4]?.[x - 2],

         this.board[y - 2]?.[x + 4],
         this.board[y - 2]?.[x - 4],
         this.board[y - 4]?.[x + 2],
         this.board[y - 4]?.[x - 2],

         this.board[y + 2]?.[x],
         this.board[y - 2]?.[x],
         this.board[y]?.[x + 2],
         this.board[y]?.[x - 2]
      ];

      /*

         1, 1,
         1, -1,
         -1, 1,
         -1, -1

            m15         m14
         d32   m07   m06   d12
      m13   d31   m17   d11   m12
         m05   d30   d10   m04
            m19   na    m18
         m01   d20   d00   m00
      m09   d21   m16   d01   m08
         d22   m03   m02   d02
            m11         m10

      */

      let additionalChecks = [
         [diagonal[0][0], diagonal[0][1], diagonal[0][2], moreSquares[8]],
         [diagonal[0][0], diagonal[0][1], diagonal[0][2], moreSquares[10]],
         [diagonal[3][0], diagonal[0][0], diagonal[0][1], moreSquares[0]],
         [diagonal[3][0], diagonal[0][0], diagonal[0][1], moreSquares[2]],
         [diagonal[3][0], diagonal[0][0], diagonal[0][1], moreSquares[17]],
         [diagonal[3][0], diagonal[0][0], diagonal[0][1], moreSquares[19]],
         [diagonal[3][1], diagonal[3][0], diagonal[0][0], moreSquares[5]],
         [diagonal[3][1], diagonal[3][0], diagonal[0][0], moreSquares[7]],
         [diagonal[3][1], diagonal[3][0], diagonal[0][0], moreSquares[16]],
         [diagonal[3][1], diagonal[3][0], diagonal[0][0], moreSquares[18]],
         [diagonal[3][2], diagonal[3][1], diagonal[3][0], moreSquares[13]],
         [diagonal[3][2], diagonal[3][1], diagonal[3][0], moreSquares[15]],
         [diagonal[1][0], diagonal[1][1], diagonal[1][2], moreSquares[12]],
         [diagonal[1][0], diagonal[1][1], diagonal[1][2], moreSquares[14]],
         [diagonal[2][0], diagonal[1][0], diagonal[1][1], moreSquares[4]],
         [diagonal[2][0], diagonal[1][0], diagonal[1][1], moreSquares[6]],
         [diagonal[2][0], diagonal[1][0], diagonal[1][1], moreSquares[16]],
         [diagonal[2][0], diagonal[1][0], diagonal[1][1], moreSquares[19]],
         [diagonal[2][1], diagonal[2][0], diagonal[1][0], moreSquares[1]],
         [diagonal[2][1], diagonal[2][0], diagonal[1][0], moreSquares[3]],
         [diagonal[2][1], diagonal[2][0], diagonal[1][0], moreSquares[17]],
         [diagonal[2][1], diagonal[2][0], diagonal[1][0], moreSquares[18]],
         [diagonal[2][2], diagonal[2][1], diagonal[2][0], moreSquares[9]],
         [diagonal[2][2], diagonal[2][1], diagonal[2][0], moreSquares[11]],

         [diagonal[0][0], moreSquares[16], moreSquares[3], moreSquares[11]],
         [diagonal[0][0], moreSquares[18], moreSquares[4], moreSquares[12]],
         [diagonal[1][0], moreSquares[17], moreSquares[7], moreSquares[15]],
         [diagonal[1][0], moreSquares[18], moreSquares[0], moreSquares[8]],
         [diagonal[2][0], moreSquares[16], moreSquares[2], moreSquares[10]],
         [diagonal[2][0], moreSquares[19], moreSquares[5], moreSquares[13]],
         [diagonal[3][0], moreSquares[17], moreSquares[6], moreSquares[14]],
         [diagonal[3][0], moreSquares[19], moreSquares[1], moreSquares[9]]
      ];

      for (let check of additionalChecks)
         if (check.every(square => square?.value === playerValue))
            wins.push(check);

      return wins.length ? wins : false; // If there is a win return wins
   }

   doBotMove() {
      players[this.toMove].player.play();
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
      let str = `+-${'-'.repeat(this.board.width)}-+\n`;
      for (let y = 0; y < this.board.length; y++) {
         str += '| ';
         for (let x = 0; x < this.board.width; x++)
            if (this.board[y][x].value === '') str += ' ';
            else if (this.board[y][x].value === ' ') str += '.';
            else str += this.board[y][x].value;
         str += ' |\n';
      }
      str += `+-${'-'.repeat(this.board.width)}-+`;
      return str;
   }

   logAscii() {
      let text = this.getAscii();
      let args = ["", []];
      for (let char of text) {
         let css = "";
         if (char === PLAYER_CHARS[0]) css = 'color:red';
         else if (char === PLAYER_CHARS[1]) css = 'color:blue';
         else if (char === PLAYER_CHARS[2]) css = 'color:green';
         else if (char === PLAYER_CHARS[3]) css = 'color:orange';
         else if (char === '.') css = 'color:white';
         else if (char === ' ') css = 'background-color:gray';
         else if (char === '-') css = 'background-color:gray;color:gray';
         else css = 'color:white';

         args[0] += '%c' + char;
         args[1].push(css);
      }
      console.log(args[0], ...args[1]);
   }


}

function handleClick(x, y) {
   console.log("Click!", x, y);
   x -= currentGame.visual.offset.x;
   y -= currentGame.visual.offset.y;
   if (
      players[currentGame.toMove].type === "human"
      && currentGame.board[y][x].value === ' '
   )
      currentGame.play(x, y);
}

function notice(...args) {
   // do something
}

const player_assets = [
   "player_assets/x.png",
   "player_assets/o.png",
   "player_assets/triangle.png",
   "player_assets/square.png"
];

const PLAYER_CHARS = "xovn";

const ELEMENTS = {
   container: document.getElementById('container'),
   infoElement: document.querySelector('#container aside'),
   gameDataElement: document.getElementById('gameData'),
   shifts: document.querySelectorAll('#mapControls button'),
   squares: [],

   getSquare(x, y) {
      return document.getElementById(`${x}-${y}`);
   },

   // {b} is unneccesary in {a b c}, the space selects all children
   getUsernameInputs() {
      return document.querySelectorAll('#nameFields fieldset input');
   },
   getEnablePersonButtons() {
      return document.querySelectorAll('#nameFields fieldset button.enable');
   },
   getDisablePersonButtons() {
      return document.querySelectorAll('#nameFields fieldset button.disable');
   },

   getPlayerSelects() {
      return document.querySelectorAll('#choosePlayerFields label select');
   },
   getEnabledPlayerSelects() {
      return document.querySelectorAll('#choosePlayerFields label select:enabled');
   },
   getEnablePlayerButtons() {
      return document.querySelectorAll('#choosePlayerFields button.enable');
   },
   getDisablePlayerButtons() {
      return document.querySelectorAll('#choosePlayerFields button.disable');
   }
};

let gameHistory = [];

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

let currentGame = new Game();





class Player {
   constructor (type, name, disabled) {
      this.type = type;
      this.name = name;
      this.disabled = disabled;
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
   random_move() {
      const moves = this.getMoves();
      const chosen = moves[Math.floor(Math.random() * moves.length)];
      this.play(chosen.x, chosen.y);
   },
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
   copy() {
      let moves = this.getMoves();
      let lastMove = this.moveHistory?.[this.moveHistory.length - 1];

      if (lastMove === undefined)
         bot_mechanics.random_move.apply(this);
      else if (this.moveHistory.length === 1)
         this.play(lastMove.x + 1, lastMove.y); // Amazing shortcut
      else {
         let secondLastMove = this.moveHistory[this.moveHistory.length - 2];
         let positionOf2ndLastMove = secondLastMove.correspondingPosition;
         let indexOfLastMove = (
            secondLastMove.gameState
               .correspondingMoves
               .findIndex(
                  position => position.x === positionOf2ndLastMove.x
                     && position.y === positionOf2ndLastMove.y
               )
         );

         if (indexOfLastMove === -1)
            throw ERRORS.IMPOSSIBLE_LAST_MOVE;
         let chosen = moves[indexOfLastMove];
         this.play(chosen.x, chosen.y);
      }
   }
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

for (let select of ELEMENTS.getPlayerSelects())
   select.onchange = function playerChange(event) {
      if (event.target.disabled) return new ElementIsDisabledError(event.target)
      let result = changePlayer.apply(event.target.selectedOptions[0]);
      console.log(result);
      return result;
   };
for (let input of ELEMENTS.getUsernameInputs())
   input.onchange = function usernameChange(event) {
      if (event.target.disabled) return new ElementIsDisabledError(event.target);
      let result = changeName.apply(event.target);
      console.log(result);
      return result;
   };


// These async functions are really fast
// They might not even need to be async functions,
// But it's nice and I might need them for tournaments.

/* EnableOrDisablePlayers
 * EnableOrDisablePeople
 * changePlayer
 * changeName
 * enablePerson
 * disablePerson
 * enablePeople
 * disablePeople
 * enablePlayer
 * disablePlayer
 * enablePlayers
 * disablePlayers
 */

async function EnableOrDisablePlayers() {
   if (this.value < activePlayers)
      return await disablePlayers(this.value);
   else if (this.value > activePlayers)
      return await enablePlayers(this.value);
   else
      throw new DidntChangeError();
}

async function EnableOrDisablePeople() {
   if (this.value < activePeople)
      return await disablePeople(this.value);
   else if (this.value > activePeople)
      return await enablePeople(this.value);
   else
      throw new DidntChangeError();
}

// this = <option>
async function changePlayer() {
   this.selected = true;

   let type = this.parentElement.label === "Bots" ? "bot" : "human"; // <optgroup> label
   // let localIndex = Array.prototype.indexOf.call(
   //    this.parentElement.children, this
   // );

   let playerIndex = this.parentElement.parentElement.parentElement.innerText[8] - 1
   if (players[playerIndex].type !== type)
      if (type === "bot") {
         activePeople--;
         activeBots++;
      } else {
         activePeople++;
         activeBots--;
      }

   players[playerIndex] = new PlayerReference(type, playerIndex);
   return ["Done! Player changed: ", players[playerIndex]];
}

// this = <input>
async function changeName() {
   let correctIndex = this.parentElement.innerText[10] - 1;
   let name = this.value.length ? this.value : this.placeholder;
   people[correctIndex].name = name;

   for (let select of ELEMENTS.getEnabledPlayerSelects())
      select.firstElementChild.children[correctIndex].text = name;
   return `Done: Name changed to ${name}`;
}

// this = <input>
async function enablePerson() {
   if (activePlayers === 4 || activePeople === 4) throw ERRORS.MAX_PLAYERS_REACHED;
   activePeople++;
   activePlayers++;

   const personIndex = this.parentElement.innerText[8] - 1;
   people[personIndex].disabled = false;

   for (let select of ELEMENTS.getPlayerSelects())
      select.firstElementChild.children[personIndex].disabled = false;

   this.disabled = true;
   this.parentElement.parentElement.children[1].disabled = true;
   this.parentElement.parentElement.children[2].disabled = false;
   return `Done: Person at index ${personIndex} enabled.`;
}


// Bug, probably feature: Player not changed when disabled
async function disablePerson() {
   if (activePlayers === 0 || activePeople === 0) throw ERRORS.EVERYONEs_ENABLED;
   activePeople--;
   activePlayers--;

   const personIndex = this.parentElement.innerText[8] - 1;
   people[personIndex].disabled = true;

   for (let select of ELEMENTS.getPlayerSelects())
      select.firstElementChild.children[personIndex].disabled = true;

   this.disabled = true;
   this.parentElement.parentElement.children[1].disabled = false;
   this.parentElement.parentElement.children[2].disabled = true;
   return `Done: Person at index ${personIndex} disabled.`;
}

// num === this.value, in above func
async function enablePeople(num) {
   let clickPromises = [];
   for (let button of ELEMENTS.getEnablePersonButtons()) {
      if (button.disabled) continue;
      clickPromises.push(button.click());
      if (activePeople + clickPromises.length === num) break;
   }

   let promiseGroup = Promise.allSettled(clickPromises);
   for (let promise of promiseGroup)
      if (promise.status === 'rejected') throw promiseGroup;

   return promiseGroup;
}

// Disables first-to-last just like enable.
async function disablePeople(num) {
   let clickPromises = [];
   for (let button of ELEMENTS.getDisablePersonButtons()) {
      if (button.disabled) continue;
      clickPromises.push(button.click());
      if (activePeople - clickPromises.length === num) break;
   }

   let promiseGroup = Promise.allSettled(clickPromises);
   for (let promise of promiseGroup)
      if (promise.status === 'rejected') throw promiseGroup;

   return promiseGroup;
}

async function enablePlayer() { }

// Min players: 1
async function disablePlayer() { }

async function enablePlayers(num) {
   let clickPromises = [];
   for (let button of ELEMENTS.getEnablePlayerButtons()) {
      if (button.disabled) continue;
      clickPromises.push(button.click());
      if (activePeople + clickPromises.length === num) break;
   }

   let promiseGroup = Promise.allSettled(clickPromises);
   for (let promise of promiseGroup)
      if (promise.status === 'rejected') throw promiseGroup;

   return promiseGroup;
}

async function disablePlayers(num) {
   let clickPromises = [];
   for (let button of ELEMENTS.getDisablePlayerButtons()) {
      if (button.disabled) continue;
      clickPromises.push(button.click());
      if (activePlayers - clickPromises.length === num) break;
   }

   let promiseGroup = Promise.allSettled(clickPromises);
   for (let promise of promiseGroup)
      if (promise.status === 'rejected') throw promiseGroup;

   return promiseGroup;
}


/*
Types: human, bot

*/
