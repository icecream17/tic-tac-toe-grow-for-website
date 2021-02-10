'use strict'

// ugh Eslint
/* global verbose pause CustomError ElementError NothingDisabledError NothingEnabledError DisabledError BotIsDisabledError ElementIsDisabledError ElementAlreadyError ElementIsAlreadyDisabledError ElementIsAlreadyEnabledError InvalidValueError MaxValueError SameValuesError DidntChangeError EvilPlayerError ERRORS NOT_DONE_YET Position Step Cell Move GameState Game handleClick notice player_assets PLAYER_CHARS PLAYER_BORDERS PLAYER_NAMES ELEMENTS gameHistory currentGame Player Human Bot PlayerReference bot_mechanics activeBots activePeople activePlayers people bots players EnableOrDisablePlayers EnableOrDisablePeople changePlayer changeName enablePerson disablePerson enablePeople disablePeople enablePlayer disablePlayer enablePlayers disablePlayers */

const NON_TOURNAMENT_BOT_MOVE_FUNC = Game.prototype.doBotMove;
const PlayerFields = Array.from(document.querySelectorAll("#choosePlayerFields select"));
let tournaments = [];

class TournamentGame {
   constructor (dict) {
      this.game = dict.game;
      this.botIDs = dict.players;
      this.bots = dict.players.map(id => bots[id]); // The bots array from game.js
   }
   
   get result() {
      if (this.game.result === null) return null;
      else if (this.game.result === "draw") return "draw";
      else return { // this.game.result === "win"
         winner: this.game.winners[0][2],
         loser: (this.game.winners[0][2] === this.bots[0] 
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
      if (typeof rounds !== "number") throw TypeError("Rounds must be a number")
      if (Number.isNaN(rounds)) throw TypeError("NaN Rounds?? Not a number.")
      if (!Number.isInteger(rounds)) throw TyeError("Integer amount of rounds required")
      if (rounds <= 0) throw RangeError("Tournament must be at least 1 round")
      
      this.currentBots = [0, 0];
      this.rounds = rounds;
      this.currentRound = 0;
      this.interval = interval;
      this.intervalID = null;
      this.previousIntervals = [];
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
         this.previousIntervals.push(this.intervalID);
         this.intervalID = null;
         Game.prototype.doBotMove = NON_TOURNAMENT_BOT_MOVE_FUNC;
         tournaments.push(this);
      }
   }
   
   forceStop () {
      console.info('Tournament force finished');
      clearInterval(this.intervalID);
      this.previousIntervals.push(this.intervalID);
      this.intervalID = null;
      Game.prototype.doBotMove = NON_TOURNAMENT_BOT_MOVE_FUNC;
      tournaments.push(this);
   }
   
   pause () {
      clearInterval(this.intervalID);
      this.previousIntervals.push(this.intervalID);
      this.intervalID = null;
   }
   
   unpause () {
      this.intervalID = setInterval(this.playGame.bind(this), this.interval);
   }
   
   /* Returns true when last game is finished */
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
            ELEMENTS.resetGameButton.click(); // Because of the if statement below
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
      if (players[this.toMove].player.type === "bot" && !this.result)
         players[this.toMove].player.play();
      else
         console.info("Player must've changed into a human");
   }
}
