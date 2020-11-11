"use strict";

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
      this.win = false;
   }
}

class Game {
   constructor() {
      // const - silently ignores any changes so watch out
      Object.defineProperty(this, "MAX_LENGTH", {value: 511});
      Object.defineProperty(this, "MAX_TURNS", {value: 292});

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
   }

   setCell(x, y, value) {
      this.board[y][x] = new Cell(value, x, y);
   }

   visualStart() {
      // the top-left of the board is 0, 0
      // second row is 1, 0
      // third row, seventh column is 3, 7

      for (let y = 0; y < this.board.length; y++) {
         for (let x = 0; x < this.board.width; x++) {
            if (this.board[y][x].value !== '') {
               getSquare(
                  this.visual.offset.x + x,
                  this.visual.offset.y + y
               ).className = 'board';
            }
         }
      }
   }

   play(x, y) {
      this.update(x, y);

      // toMove is updated now
      if (players[this.toMove].type === "bot") {
         this.doBotMove();
      }
   }

   update(x, y) {
      console.log('move: ', x, y);

      if (this.board[y][x].value !== ' ') {
         throw Error("AAA WHAT!????");
      }

      let newXY = this.updateBoard(x, y)
      x = newXY.x;
      y = newXY.y;

      let moveFinish = this.checkGameEnd(x, y);
      if (moveFinish !== false) {
         // TODO: Put something better than alert, for bots. Like a notice
         if (moveFinish[0] === "draw") {alert("draw! \n" + moveFinish[1]);}
         else {
            // moveFinish[0] === "win"
            for (let cell of moveFinish[1].concat(this.board[y][x])) {
               cell.win = true;
            }
         }
      }

      this.updateVisual();

      this.toMove = (this.toMove + 1) % players.length;
      console.log("update:", x, y, moveFinish);
   }

   updateBoard(x, y) {
      // Possible bug in the future, the else ifs assume that the
      // first cell is not the same as the last cell, which would be untrue if
      // the width or height was 1

      if (y === 0) {
         this.board.unshift([]);
         for (let i = 0; i < this.board.width; i++) {
            this.board[0].push(
               new Cell(i === x ? ' ' : '', i, 0)
            );
         }
         this.board.height++; y++;
      } else if (y === this.board.height - 1) {
         this.board.push([]);
         this.board.height++;
         for (let i = 0; i < this.board.width; i++) {
            this.board[this.board.height - 1].push(
               new Cell(i === x ? ' ' : '', i, this.board.height - 1)
            );
         }
      }

      if (x === 0) {
         for (let i = 0; i < this.board.length; i++) {
            this.board[i].unshift(
               new Cell(i === y ? ' ' : '', i, 0)
            );
         }
         this.board.width++; x++;
      } else if (x === this.board.width - 1) {
         for (let i = 0; i < this.board.length; i++) {
            this.board[i].push(
               new Cell(i === y ? ' ' : '', i, this.board.width)
            );
         }
         this.board.width++;
      }


      if (this.board[y - 1][x].value === '') {this.setCell(x, y - 1, ' ');}
      if (this.board[y + 1][x].value === '') {this.setCell(x, y + 1, ' ');}
      if (this.board[y][x - 1].value === '') {this.setCell(x - 1, y, ' ');}
      if (this.board[y][x + 1].value === '') {this.setCell(x + 1, y, ' ');}

      this.board[y][x] = new Cell("xo/<"[this.toMove], x, y);

      for (let y = 0; y < this.board.length; y++) {
         for (let x = 0; x < this.board.width; x++) {
            this.board[y][x].y = y;
            this.board[y][x].x = x;
         }
      }

      return this.board[y][x];
   }

   // Same as visualStart really
   updateVisual() {
      for (let y = 0; y < 20; y++) {
         for (let x = 0; x < 20; x++) {
            getSquare(x, y).className = '';
            getSquare(x, y).style.background = '';
         }
      }

      for (let y = 0; y < this.board.height; y++) {
         for (let x = 0; x < this.board.width; x++) {
            let element = getSquare(
               this.visual.offset.x + x,
               this.visual.offset.y + y
            );
            if (element === null) {continue}
            if (this.board[y][x].value !== '') {
               element.className = 'board';

               if (this.board[y][x].value !== ' ') {
                  let whichAsset = "xo/<".indexOf(this.board[y][x].value);

                  if (whichAsset === -1) {
                     element.style.background = "red";
                  } else {
                     element.style.background = (
                        `url("${player_assets[whichAsset]}")`
                     );
                  }

                  if (this.board[y][x].win) {
                     element.classList.add("win");
                  }
               } else {
                  element.style.background = '';
               }
            } else {
               element.className = '';
               element.style.background = '';
            }
         }
      }
   }

   checkGameEnd(x, y) {
      let win = this.checkWin(x, y)
      if (win) {return ["win", win]}

      if (this.board.width > 7 * this.board.height) {
         return ["draw", "width is 7 times the height"]
      } else if (this.board.height > 7 * this.board.width) {
         return ["draw", "height is 7 times the width"]
      }
      return false;
   }

   checkWin(x, y) {
      let playerValue = this.board[y][x].value
      let orthogonal = [[], [], [], []];
      let diagonal = [[], [], [], []];
      for (let i = 0; i < 4; i++) {
         let orthogonalStep = [
            new Step(-1, 0),
            new Step(1, 0),
            new Step(0, 1),
            new Step(0, -1),
         ][i];

         let diagonalStep = [
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

            if (square?.value !== playerValue) {break;}
            orthogonal[i].push(square);
         }
         for (let j = 1; j < 7; j++) {
            let square = this.board[
               y + (diagonalStep.vy * j)
            ]?.[
               x + (diagonalStep.vx * j)
            ];

            if (square?.value !== playerValue) {break;}
            diagonal[i].push(square);
         }
      }

      // good good good n good good good
      function sevenNArow (oneDirection, oppositeDirection) {
         if (oneDirection.length + oppositeDirection.length >= 6) {
            return oneDirection.concat(...oppositeDirection);
         }
         return false;
      }

      function checkMark (side1, side2) {
         if (side1.length >= 3 && side2.length >= 1 ||
            side2.length >= 3 && side1.length >= 1
         ) {
            return side1.concat(...side2);
         }
         return false;
      }

      let sevenChecks = [
         sevenNArow(orthogonal[0], orthogonal[1]),
         sevenNArow(orthogonal[2], orthogonal[3]),
         sevenNArow(diagonal[0], diagonal[3]),
         sevenNArow(diagonal[1], diagonal[2])
      ]

      if (sevenChecks.find(check => Boolean(check))) {
         return sevenChecks.find(check => Boolean(check));
      }

      let markChecks = [
         checkMark(diagonal[0], diagonal[1]),
         checkMark(diagonal[0], diagonal[2]),
         checkMark(diagonal[3], diagonal[1]),
         checkMark(diagonal[3], diagonal[2]),
      ]

      if (markChecks.find(check => Boolean(check))) {
         return markChecks.find(check => Boolean(check));
      }


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

      for (let check of additionalChecks) {
         if (check.every(square => square?.value === playerValue)) {
            return check;
         }
      }


      return false;
   }

   doBotMove() {
      getCurrentBot().play();
   }

   getMoves() {
      let moves = [];
      for (let y = 0; y < this.board.height; y++) {
         for (let x = 0; x < this.board.width; x++) {
            if (this.board[y][x].value === ' ') {
               moves.push(new Position(x, y));
            }
         }
      }
      return moves;
   }
}


function getPlayerName(index) {
   return (
      document.getElementById(`whoPlays${index + 1}`).nextElementSibling.value
   );
}

function getSquare(x, y) {
   return document.getElementById(x + '-' + y);
}

function handleClick(x, y) {
   console.log("Click!", x, y);
   x -= currentGame.visual.offset.x;
   y -= currentGame.visual.offset.y;
   if (
      players[currentGame.toMove].type === "human" &&
      currentGame.board[y][x].value === ' '
   ) {
      currentGame.play(x, y);
   }
}

const player_assets = [
   "player_assets/x.png",
   "player_assets/o.png",
   "player_assets/triangle.png",
   "player_assets/square.png"
];

const container = document.getElementById('container');
const infoElement = document.querySelector('#container aside');
const gameDataElement = document.getElementById('gameData');

let shifts = document.querySelectorAll('#mapControls button');
let squares = []; // element

let gameHistory = [];

// up down left right
shifts[0].onclick = () => {
   currentGame.visual.offset.y--;
   currentGame.updateVisual();
};
shifts[1].onclick = () => {
   currentGame.visual.offset.y++;
   currentGame.updateVisual();
};
shifts[2].onclick = () => {
   currentGame.visual.offset.x--;
   currentGame.updateVisual();
};
shifts[3].onclick = () => {
   currentGame.visual.offset.x++;
   currentGame.updateVisual();
};

for (let x = 0; x < 20; x++) {
   squares[x] = [];
   for (let y = 0; y < 20; y++) {
      let element = document.createElement('button');
      squares[x].push(element);

      element.id = x + '-' + y;
      element.setAttribute("aria-label", `Square at ${x}-${y}`);
      element.style.gridColumn = x + 1;
      element.style.gridRow = y + 1;
      element.onclick = handleClick.bind(element, x, y);
      container.appendChild(element);
   }
}

let currentGame = new Game();





class Player {
   constructor (type, name) {
      this.type = type;
      this.name = name;
   }
}

class Human extends Player {
   constructor (name) {
      super("human", name);
   }
}

class Bot extends Player {
   constructor (name, mechanics) {
      super("bot", name);
      this.play = mechanics.bind(currentGame)
   }
}

function addNameField() {
   let humanNamesField = document.createElement('fieldset');
   humanNamesField.id = `human-${numHumans}`;
   humanNamesField.label = document.createElement('label');
   humanNamesField.label.id = `human-label-${numHumans}`;
   humanNamesField.label.innerText = "(#1) name:";
   humanNamesField.appendChild(humanNamesField.label);
   humanNamesField.label.setAttribute(
      "aria-label", `Name for person ${numHumans}`
   );
   humanNamesField.setAttribute(
      "aria-labelledby", `human-label-${numHumans}`
   );

   let input = document.createElement('input');
   input.id = `human-name-${numHumans}`
   input.setAttribute('placeholder', `person ${numHumans}`);
   input.setAttribute("aria-labelledby", `human-label-${numHumans}`);
   humanNamesField.appendChild(input);

   let fieldDelete = document.createElement('button');
   fieldDelete.className = 'delete';
   fieldDelete.innerText = 'delete';

   let fieldAdd = document.createElement('button');
   fieldAdd.className = 'delete';
   fieldAdd.innerText = 'delete';

   // TODO: fieldDelete.onclick
   humanNamesField.appendChild(fieldDelete);
   gameDataElement.appendChild(humanNamesField);
}

const bot_mechanics = {
   random_move() {
      let moves = this.getMoves();
      let chosen = moves[Math.floor(Math.random() * moves.length)];
      this.play(chosen.x, chosen.y);
   },
   middle_index() {
      let moves = this.getMoves();
      let chosen = moves[Math.round(moves.length / 2)]; // Not perfectly uniform
      this.play(chosen.x, chosen.y);
   }
};


let numHumans = 0; // Number of players represented by people
let numPlayers = 0;
let numPlayerBots = 0;

let people = [];
let bots = [];
let players = []; // Contains {type, index} based on dropdowns

for (let key of Object.keys(bot_mechanics)) {
   let newBot = new Bot(key, bot_mechanics[key]);
   bots.push(newBot)
   bots[key] = newBot;
}





/* 
HTML:

<dropdown> = <select>
<dropdown>:Values = <dropdown>.options.map(option => option.value)
<dropdown>:Default = <option selected>.value

<input>:Default = <input placeholder>

Number of players: <dropdown> -> onchange addOrDeletePlayers()
   <dropdown>
 - Default: 2
 - Values: 2, 3, 4
Number of people: <dropdown> -> onchange addOrDeletePeople()
   <dropdown>
 - Default: 1
 - Values: 0, 1, 2, 3, 4
Person #n: <input> <button.x> <button.add> -> onchange changeName(), onclick deletePerson(), onclick addPerson()
   <input>
 - Default: Person n
 - Values: [Any]
Player #1: <dropdown> <button.x> <button.add> -> onchange changePlayer(), onclick deletePlayer(), onclick addPlayer()
   <dropdown>
 - Layout:
   = <select>
   =   <optgroup label="Humans">
   =      with n, from 0 to [Number of people], an <option> with a value of [Person #n]
   =   </optgroup>
   =   <optgroup label="Bots">
   =      for each bot, an <option> with a value of bot.name
 - Default:
   If parent.indexOf(this) < Number of people,
       <Person>[parent.indexOf(this)].name
   Else
       <Bot>[parent.indexOf(this) - (Number of people)].name





*/
