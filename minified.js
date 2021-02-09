// This is licensed under the Apache License 2.0,
// see https://github.com/icecream17/tic-tac-toe-grow-for-website/blob/main/LICENSE

// If you're a developer see this repository:
// https://github.com/icecream17/tic-tac-toe-grow-for-website

// This minified code is both the game.js and tournament.js codes combined.

"use strict";async function pause(ms){return await new Promise(resolve=>setTimeout(resolve,ms,"Done!"))}const a=Array,b="prototype",v="value",c=v+"sEqual",d="isArray",e="length",f="name"
a[b][c]=function valuesEqual(arr){if(!a[d](arr)||this[e]!==arr[e])return!1
for(let i=0;i<this[e];i++)if(a[d](this[i])&&a[d](arr[i]))if(!this[i][c](arr[i]))return!1
else if(this[i]!==arr[i])return!1
return!0;}
class CustomError extends Error{get name(){return this.constructor[f]}}const g=CustomError,h=document,K="Element",L="create"+K,k="Nothing",l="annot ",m="enable",n="disable",o=" since all ",p=" are already ",q=m+"d",r=n+"d"
class ElementError extends g{constructor(message,element=h[L]('HTMLUnknown'+K)){super(message);this.element=element}}class NothingDisabledError extends g{constructor(noun=k,plural=`${noun}s`,message=`C${l+m} ${noun+o+plural+p+q}.`){super(message)}}class NothingEnabledError extends g{constructor(noun=k,plural=`${noun}s`,message=`C${l+n} ${noun+o+plural+p+r}.`){super(message)}}class DisabledError extends g{constructor(noun,condition=''){if(condition[e]!==0)condition=' and '+condition;super(`${noun} is ${r+condition}.`)}}const s=ElementError,t=DisabledError
class BotIsDisabledError extends t{constructor(bot){super(bot[f],`c${l}play`);this.bot=bot}}class ElementIsDisabledError extends t{constructor(element,message="shouldn't be changed"){super(element.tagName,message);this.element=element}}class ElementAlreadyError extends s{constructor(element,isAlreadyWhat){super(element.tagName+" element is already "+isAlreadyWhat,element)}}const u=ElementAlreadyError
class ElementIsAlreadyDisabledError extends u{constructor(element){super(element,r)}}class ElementIsAlreadyEnabledError extends u{constructor(element){super(element,q)}}class InvalidValueError extends g{constructor(valueName=v+" identifier unprovided",message=`Invalid internal ${v}! (${valueName})`){super(message)}}const w=InvalidValueError,A=" the same "
class MaxValueError extends w{constructor(message=`Max ${v} reached`){super(message)}}class SameValuesError extends g{constructor(message=`Some ${v}s are${A}when they shouldn't be`){super(message)}}class DidntChangeError extends SameValuesError{constructor(message='Something "changed" to'+A+v){super(message)}}class EvilPlayerError extends CustomError{constructor(message='hmmph'){super(message)}}const B=(a,...b)=>new a(...b),C=ReferenceError,D="person",E="people",F=EvilPlayerError,G="square"
const ERRORS={SQUARE_NOT_UPDATED:B(w,G,"AAA WHAT!????"),INVALID_MOVE_FINISH:B(w,"moveFinish"),IMPOSSIBLE_LAST_MOVE:B(C,"Last move was not an option...?"),MAX_PLAYERS_REACHED:B(MaxValueError,"Max players reached"),EVERYONEs_ENABLED:B(NothingDisabledError,D,E),NO_ONEs_ENABLED:B(NothingEnabledError,D,E),EVIL_CLICK:B(F,"Hey, you're not supposed to click that"),EVIL_CHANGE:B(F,"How did you do that")}
const NOT_DONE_YET="This feature is not finished yet. So it doesn't work"
class Position{constructor(x,y){this.x=x;this.y=y}distance(position){return Math.abs(this.x-position.x)+Math.abs(this.y-position.y)}copy(){return new Position(this.x,this.y)}}class Step{constructor(vx,vy){this.vx=vx;this.vy = vy}}const H=Position,I="game",J="moveHistory",M="index",N="player",O="positionAtLastUpdate",P="lastUpdateIndex",Q="originalPosition",R="moveIndex",S="gameState",T="getGameStateAt"
class Cell extends H{constructor(value,x,y){super(x,y);this[v]=value;this.win=!1;this[R]=null}}
class Move extends H{constructor(oldXY,newXY,player,game=currentGame){super(newXY.x,newXY.y);this[I]=game;this[M]=game[J][e];this[N]=player;this[O]=B(Position,this.x,this.y);this[P]=this[M];this[Q]=oldXY}
   get [S](){return this[I][T](this[M])}
   get correspondingPosition() {
      for (; this[P] < this[I][J].length; this[P]++) {
         const nextMove = this[I][J][this[P]][Q];
         if (nextMove.x === 0) this[O].x++;
         if (nextMove.y === 0) this[O].y++;
      }
      return this[O].copy();
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
      this.turn = 0; 
      this.ply = 0;
      this.toMove = 0;
      this.result = null;
      this.winners = [];

      this.board = [
         [new Cell(' ', 0, 0), new Cell(' ', 0, 1), new Cell(' ', 0, 2)],
         [new Cell(' ', 1, 0), new Cell(' ', 1, 1), new Cell(' ', 1, 2)],
         [new Cell(' ', 2, 0), new Cell(' ', 2, 1), new Cell(' ', 2, 2)]
      ];
      this.board.width = 3;
      this.board.height = 3;

      this[J] = [];
   }

   set MAX_LENGTH(value) { this.#MAX_LENGTH = value }
   get MAX_LENGTH() { return this.#MAX_LENGTH }
   set MAX_TURNS(value) { this.#MAX_TURNS = value }
   get MAX_TURNS() { return this.#MAX_TURNS }

   setCell(x, y, value) {
      this.board[y][x] = new Cell(value, x, y);
   }

   updateBoard(x, y) {
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
      this.board[y][x][R] = this[J].length;

      for (let y2 = 0; y2 < this.board.length; y2++)
         for (let x2 = 0; x2 < this.board.width; x2++) {
            this.board[y2][x2].y = y2;
            this.board[y2][x2].x = x2;
         }

      return this.board[y][x];
   }


   updateGameEnd(result, lastX, lastY) {
      this.result ??= result[0];

      switch (result[0]) {
         case "win":
            {
               notice("WINNNN", result);
               for (let cell of result[1].flat().concat(this.board[lastY][lastX]))
                  cell.win = true;

               let winArray = [this.toMove, PLAYER_NAMES[this.toMove], players[this.toMove][N]];
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

      const goDiagonal = (x2, y2, step) => {
         let diag = [this.board[y2][x2]];
         let currentPos = new Position(x2, y2);

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

      const checkmarks = (diag, oppDiag, perpStep, oppPerpStep) => {
         let newWins = [];
         let currBase = [...oppDiag.slice(1), diag[0]];
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

      return wins.length ? wins : false;
   }


   getMoves() {
      let moves = [];
      for (let y = 0; y < this.board.height; y++)
         for (let x = 0; x < this.board.width; x++)
            if (this.board[y][x].value === ' ')
               moves.push(new Position(x, y));
      return moves;
   }

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
      this[I] = game;
   }

   doMove (move) {
      let {x, y} = move[Q];
      if (this.board[y][x].value !== ' ')
         throw ERRORS.SQUARE_NOT_UPDATED;

      ({x, y} = Game.prototype.updateBoard.call(this, x, y));

      let moveFinish = Game.prototype.checkGameEnd.call(this, x, y);
      if (moveFinish !== false) Game.prototype.updateGameEnd.call(this, moveFinish, x, y);

      this[J].push(move);
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
            let index = this[J].length;
            index < this[I][J].length;
            index++
         ) {
            const nextMove = this[I][J][index][Q];
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

      this[J].push(new Move(oldPosition, {x, y}, players[this.toMove], this));
      players[this.toMove].lastMove = this[J][this[J].length - 1];

      if (this === currentGame) this.updateVisual();

      this.ply++;
      this.toMove = (this.toMove + 1) % players.length;
      if (this.toMove === 0) this.turn++;

      if (this === currentGame) this.updateVisualStats();

      console.debug(`(update) move: ${x} ${y}, moveFinish: ${moveFinish}`);
   }

   updateVisualStats() {
      ELEMENTS.statsParagraph.innerText =
`Width: ${this.board.width}
Height: ${this.board.height}
Turns: ${this.turn}`;
   }

   updateVisual() {
      for (let y = 0; y < 20; y++)
         for (let x = 0; x < 20; x++) {
            let button = ELEMENTS.getSquare(x, y);
            let cell = this.board?.[y - this.visual.offset.y]?.[x - this.visual.offset.x];

            button.classList.remove("board", "win");
            button.style.removeProperty("border-color");
            button.style.removeProperty("background-color");
            button.style.removeProperty("background-image");

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
               else if (players?.[playerIndex].lastMove?.[M] === cell[R])
                  button.style.borderColor = PLAYER_BORDERS[playerIndex];
            }
         }
   }

   [T](moveIndex) {
      let gameCopy = new GameState(this);
      for (let i = 0; i < moveIndex; i++)
         gameCopy.doMove(this[J][i]);
      
      return gameCopy;
   }

   doBotMove() {
      if (players[this.toMove][N].type === "bot")
         players[this.toMove][N].play();
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
}

const player_assets = [
   "player_assets/x.png",
   "player_assets/o.png",
   "player_assets/triangle.png",
   `player_assets/${G}.png`
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
   G,
   "pentagon"
];

const ELEMENTS = {
   container: h.getElementById('container'),
   infoElement: h.querySelector('#container aside'),
   gameDataElement: h.getElementById('gameData'),
   numPeopleSelect: h.querySelector('#personCountLabel select'),
   numPlayersSelect: h.querySelector('#playerAmountLabel select'),
   resetGameButton: h.getElementById('resetGame'),
   shifts: h.querySelectorAll('#mapControls button'),
   statsParagraph: h.getElementById('nonPlayerStats'),
   [G+"s"]: [],

   getSquare(x, y) {
      return h.getElementById(`${x}-${y}`);
   },

   getUsernameInputs() {
      return h.querySelectorAll('#nameFields input');
   },
   getEnablePersonButtons() {
      return h.querySelectorAll('#nameFields button.enable');
   },
   getDisablePersonButtons() {
      return h.querySelectorAll('#nameFields button.disable');
   },

   getPlayerSelects() {
      return h.querySelectorAll('#choosePlayerFields select');
   },
   getEnabledPlayerSelects() {
      return h.querySelectorAll('#choosePlayerFields select:enabled');
   },
   getEnablePlayerButtons() {
      return h.querySelectorAll('#choosePlayerFields button.enable');
   },
   getDisablePlayerButtons() {
      return h.querySelectorAll('#choosePlayerFields button.disable');
   }
};

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
      let element = h[L]('button');
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
ELEMENTS.numPeopleSelect.onchange = function (event) {
   console.debug(EnableOrDisablePlayers.call(event.target));
};
ELEMENTS.numPlayersSelect.onchange = function (event) {
   console.debug(EnableOrDisablePeople.call(event.target));
};
for (let input of ELEMENTS.getUsernameInputs())
   input.onchange = function usernameChange(event) {
      if (event.target.disabled) throw new ElementIsDisabledError(event.target);
      console.debug(changeName.call(event.target));
   };
for (let button of ELEMENTS.getEnablePersonButtons())
   button.onclick = function (event) {
      if (event.target.disabled) throw new ElementIsAlreadyEnabledError(event.target);
      console.debug(enablePerson.call(event.target.parentElement.children[0].children[1]));
   };
for (let button of ELEMENTS.getDisablePersonButtons())
   button.onclick = function (event) {
      if (event.target.disabled) throw new ElementIsAlreadyDisabledError(event.target);
      console.debug(disablePerson.call(event.target.parentElement.children[0].children[1]));
   };
for (let select of ELEMENTS.getPlayerSelects())
   select.onchange = function playerChange(event) {
      if (event.target.disabled) throw new ElementIsDisabledError(event.target);
      console.debug(changePlayer.call(event.target));
   };
for (let button of ELEMENTS.getEnablePlayerButtons())
   button.onclick = function (event) {
      if (event.target.disabled) throw new ElementIsAlreadyEnabledError(event.target);
      console.debug(enablePlayer.call(event.target.parentElement.children[0].children[1]));
   };
for (let button of ELEMENTS.getDisablePlayerButtons())
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
      this[M] = index;
   }

   get player() {
      if (this.type === "human")
         return people[this[M]];
      else
         return bots[this[M]];
   }

   set disabled(isDisabled) {
      this[N].disabled = isDisabled;
   }

   get disabled() {
      return this[N].disabled;
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
      let lastMove = this[J]?.[this[J].length - 1];
      let positionOfLastMove = lastMove?.[Q];

      if (lastMove === undefined)
         bot_mechanics.random_move.apply(this);
      else {
         let indexOfLastMove = (
            lastMove[S]
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
   avoider() {
      let moves = this.getMoves();
      let best_moves = [-Infinity, []]
      for (let move of moves) {
         let score = 0;
         for (let historicalMove of this[J])
            score += historicalMove.updatedDistance(move);
         if (score === best_moves[0]) best_moves[1].push(move);
         else if (score > best_moves[0]) best_moves = [score, [move]];
      }

      const chosen = best_moves[1][Math.floor(Math.random() * best_moves[1].length)];
      this.play(chosen.x, chosen.y);
   },
   closer() {
      let moves = this.getMoves();
      let best_moves = [-Infinity, []];
      for (let move of moves) {
         let score = 100_000;
         for (let historicalMove of this[J]) {
            score -= historicalMove.updatedDistance(move);
            if (score < best_moves[0]) break;
         }
         if (score === best_moves[0]) best_moves[1].push(move);
         else if (score > best_moves[0]) best_moves = [score, [move]];
      }

      const chosen = best_moves[1][Math.floor(Math.random() * best_moves[1].length)];
      this.play(chosen.x, chosen.y);
   },
   firstDiagonal() {
      let positionOnDiagonal;
      if (this[J].length) {
         let move = this[J][0];
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


async function EnableOrDisablePlayers() {
   if (this.value < activePlayers)
      return await disablePlayers(Number(this.value));
   else if (this.value > activePlayers)
      return await enablePlayers(Number(this.value));
   else
      throw new DidntChangeError();
}

async function EnableOrDisablePeople() {
   if (this.value < activePeople)
      return await disablePeople(Number(this.value));
   else if (this.value > activePeople)
      return await enablePeople(Number(this.value));
   else
      throw new DidntChangeError();
}

async function changePlayer() {
   let option = this.selectedOptions[0];
   option.selected = true;

   let type = option.parentElement.label === "Bots" ? "bot" : "human";

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

async function changeName() {
   let correctIndex = this.parentElement.id[13] - 1;
   let name = this.value.length ? this.value : this.placeholder;
   people[correctIndex].name = name;

   for (let select of ELEMENTS.getPlayerSelects())
      select.firstElementChild.children[correctIndex].text = name;
   return `Done: Name changed to ${name}`;
}

async function enablePerson() {
   if (activePeople === 4) throw ERRORS.EVERYONEs_ENABLED;
   activePeople++; ELEMENTS.numPeopleSelect.selectedIndex++;

   const personIndex = this.parentElement.innerText[10] - 1;
   people[personIndex].disabled = false;

   for (let select of ELEMENTS.getPlayerSelects())
      select.firstElementChild.children[personIndex].disabled = false;

   this.disabled = false;
   this.parentElement.parentElement.children[1].disabled = true;
   this.parentElement.parentElement.children[2].disabled = false;
   return `Done: Person at index ${personIndex} enabled.`;
}

async function disablePerson() {
   if (activePeople === 0) throw ERRORS.NO_ONEs_ENABLED;
   activePeople--; ELEMENTS.numPeopleSelect.selectedIndex--;

   const personIndex = this.parentElement.id[13] - 1;
   people[personIndex].disabled = true;

   for (let select of ELEMENTS.getPlayerSelects())
      select.firstElementChild.children[personIndex].disabled = true;

   this.disabled = true;
   this.parentElement.parentElement.children[1].disabled = false;
   this.parentElement.parentElement.children[2].disabled = true;
   return `Done: Person at index ${personIndex} disabled.`;
}

async function enablePeople(num) {
   let clickPromises = [];
   let counter = activePeople;
   for (let button of ELEMENTS.getEnablePersonButtons()) {
      if (button.disabled) continue;
      clickPromises.push(button.click());
      
      if (++counter === num) break;
   }

   let promiseGroup = Promise.allSettled(clickPromises);
   for (let promise of promiseGroup)
      if (promise.status === 'rejected') throw promiseGroup;

   if (counter !== num)
      console.warn(`Failed to enable the correct amount: ${counter} !== ${num}`);

   return promiseGroup;
}

async function disablePeople(num) {
   let clickPromises = [];
   let counter = activePeople;
   for (let button of ELEMENTS.getDisablePersonButtons()) {
      if (button.disabled) continue;
      clickPromises.push(button.click());
      if (--counter === num) break;
   }

   let promiseGroup = Promise.allSettled(clickPromises);
   for (let promise of promiseGroup)
      if (promise.status === 'rejected') throw promiseGroup;

   activePeople = counter;
   if (counter !== num)
      console.warn(`Failed to disable the correct amount: ${counter} !== ${num}`);

   return promiseGroup;
}

async function enablePlayer() {
   if (activePlayers === 4) throw ERRORS.MAX_PLAYERS_REACHED;
   activePlayers++; ELEMENTS.numPeopleSelect.selectedIndex++;
   activeBots++;

   this.disabled = false;
   this.parentElement.nextElementSibling.disabled = true;
   this.parentElement.nextElementSibling.nextElementSibling.disabled = false;

   this.selectedIndex = 4;
   
   players.push(new PlayerReference("bot", 0));
   this.dispatchEvent(new Event("change"));

   return "Done! Enabled player (random_move for safety)";
}

async function disablePlayer() {
   console.warn(NOT_DONE_YET);
}
async function enablePlayers(num) {
   let clickPromises = [];
   let counter = activePlayers;
   for (let button of ELEMENTS.getEnablePlayerButtons()) {
      if (button.disabled) continue;
      clickPromises.push(button.click());
      if (++counter === num) break;
   }

   let promiseGroup = await Promise.allSettled(clickPromises);
   for (let promise of promiseGroup)
      if (promise.status === 'rejected') throw promiseGroup;
   activePlayers = counter;
   if (counter !== num)
      console.warn(`Failed to enable the correct amount: ${counter} !== ${num}`);
   
   return promiseGroup;
}

async function disablePlayers(num) {
   let clickPromises = [];
   let counter = activePlayers;
   for (let button of ELEMENTS.getDisablePlayerButtons()) {
      if (button.disabled) continue;
      clickPromises.push(button.click());
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

const NON_TOURNAMENT_BOT_MOVE_FUNC = Game.prototype.doBotMove;
const PlayerFields = Array.from(h.querySelectorAll("#choosePlayerFields select"));
let tournaments = [];

class TournamentGame {
   constructor (dict) {
      this[I] = dict[I];
      this.botIDs = dict.players;
      this.bots = dict.players.map(id => bots[id]);
   }
   
   get result() {
      if (this[I].result === null) return null;
      else if (this[I].result === "draw") return "draw";
      else return {
         winner: this[I].winners[0][2],
         loser: (this[I].winners[0][2] === this.bots[0] 
                 ? this.bots[1]
                 : this.bots[0])
      };
   }
}

class TournamentGameList extends Array {
   constructor (tournament) {
      super();
      this.tournament = tournament;
   }
   
   add (dictOrGame) {
      if (dictOrGame instanceof TournamentGame) this.push(dictOrGame);
      else this.push(new TournamentGame(dictOrGame));
   }

   get results() {
      let table = new Map();

      for (let tournamentGame of this) {
         let gameResult = tournamentGame.result;
         if (gameResult === null) return null;
         else if (gameResult === "draw") {
            if (!table.has(tournamentGame.bots[0])) table.set(tournamentGame.bots[0], new Map());
            if (!table.get(tournamentGame.bots[0]).has(tournamentGame.bots[1])) table.get(tournamentGame.bots[0]).set(tournamentGame.bots[1], {wins: 0, draws: 1, losses: 0});
            else table.get(tournamentGame.bots[0]).get(tournamentGame.bots[1]).draws++;
            
            if (!table.has(tournamentGame.bots[1])) table.set(tournamentGame.bots[1], new Map());
            if (!table.get(tournamentGame.bots[1]).has(tournamentGame.bots[0])) table.get(tournamentGame.bots[1]).set(tournamentGame.bots[0], {wins: 0, draws: 1, losses: 0});
            else table.get(tournamentGame.bots[1]).get(tournamentGame.bots[0]).draws++;
         } else { // gameResult = {winner: bot, loser: bot}
            let {winner, loser} = gameResult;

            if (!table.has(winner)) table.set(winner, new Map());
            if (!table.get(winner).has(loser)) table.get(winner).set(loser, {wins: 1, draws: 0, losses: 0});
            else table.get(winner).get(loser).wins++;
            
            if (!table.has(loser)) table.set(loser, new Map());
            if (!table.get(loser).has(winner)) table.get(loser).set(winner, {wins: 0, draws: 0, losses: 1});
            else table.get(loser).get(winner).losses++;
         }
      }

      return table;
   }
}

class Tournament {
   constructor (rounds, interval=4000) {
      this.currentBots = [0, 0];
      this.rounds = rounds;
      this.currentRound = 0;
      this.interval = interval;
      this.intervalID = null;
      this.games = new TournamentGameList(this);
      this.finished = false;
   }

   start () {
      console.info('Tournament started');
      console.info('Round 0 started');
      Game.prototype.doBotMove = Tournament.botMoveFunc;
      this.intervalID = setInterval(this.playGame.bind(this), this.interval);
   }

   finish () {
      this.finished = this.waitForLastGame();

      if (this.finished) {
         console.info('Tournament finished');
         clearInterval(this.intervalID);
         this.previousID = this.intervalID;
         this.intervalID = null;
         Game.prototype.doBotMove = NON_TOURNAMENT_BOT_MOVE_FUNC;
         tournaments.push(this);
      }
   }
   
   waitForLastGame () {
      if (!currentGame.result) return false;
      PlayerFields[0].selectedIndex = 0;
      PlayerFields[0].dispatchEvent(new Event("change"));
      return true;
   }

   playGame () {
      if (this.currentBots[0] === bots.length) {
         console.info(`Round ${this.currentRound} finished.`);
         this.currentRound++;
         if (this.currentRound >= this.rounds)
            this.finish();
         else {
            console.info(`Round ${this.currentRound} started.`);
            this.currentBots = [0, 0];
            ELEMENTS.resetGameButton.click();
         }

         return;
      }
      if (!currentGame.result &&
         this.currentBots[0] + this.currentBots[1] !== 0) return;
        
      PlayerFields[0].selectedIndex = 0;
      PlayerFields[0].dispatchEvent(new Event("change"));

      if (this.currentBots[0] + this.currentBots[1] !== 0)
         ELEMENTS.resetGameButton.click();

      PlayerFields[0].selectedIndex = 4 + this.currentBots[0];
      PlayerFields[1].selectedIndex = 4 + this.currentBots[1];
      PlayerFields[1].dispatchEvent(new Event("change"));
      PlayerFields[0].dispatchEvent(new Event("change"));
      this.games.add({game: currentGame, players: [this.currentBots[0], this.currentBots[1]]});

      this.currentBots[1]++;
      if (this.currentBots[1] === bots.length) {
         this.currentBots[1] = 0;
         this.currentBots[0]++;
         if (this.currentBots[0] === bots.length)
            return true;
      }
      return false;
   }
    
   static botMoveFunc () {
      if (players[this.toMove][N].type === "bot" && !this.result)
         players[this.toMove][N].play();
      else
         console.info("Player must've changed into a human");
   }
}

