// TODO
let bot_iterator = Object.entries(bot_mechanics);
const NON_TOURNAMENT_BOT_MOVE_FUNC = Game.prototype.doBotMove;
const PlayerFields = Array.from(document.querySelectorAll("#choosePlayerFields select"))
let tournaments = [];

class Tournament {
   constructor (rounds, interval=4000) {
      this.currentBots = [0, 0];
      this.rounds = rounds;
      this.currentRound = 0;
      this.interval = interval;
      this.intervalID = null;
   }

   start () {
      Game.prototype.doBotMove = Tournament.botMoveFunc;
      this.intervalID = setInterval(this.playGame.bind(this), this.interval);
   }

   finish () {
      clearInterval(this.intervalID);
      this.intervalID = null;
      Game.prototype.doBotMove = NON_TOURNAMENT_BOT_MOVE_FUNC;
      tournaments.push(this);
   }

   playGame () {
      if (this.currentBots[0] === bot_iterator.length) {
         this.currentBots = [0, 0];
         this.currentRound++;

         if (this.currentRound === this.rounds)
            this.finish();

         return;
      }
      if (!this.currentGame.result &&
         this.currentBots[0] + this.currentBots[1] !== 0) return;
        
      PlayerFields[0].selectedIndex = 0;
      PlayerFields[0].dispatchEvent(new Event("change"));

      if (this.currentBots[0] + this.currentBots[1] !== 0)
         ELEMENTS.resetGameButton.click();

      PlayerFields[0].selectedIndex = 4 + this.currentBots[0];
      PlayerFields[1].selectedIndex = 4 + this.currentBots[1];
      PlayerFields[1].dispatchEvent(new Event("change"));
      PlayerFields[0].dispatchEvent(new Event("change"));
      this.games.push([currentGame, this.currentBots[0], this.currentBots[1]]);

      this.currentBots[1]++;
      if (this.currentBots[1] === bot_iterator.length) {
         this.currentBots[1] = 0;
         this.currentBots[0]++;
         if (this.currentBots[0] === bot_iterator.length)
            return true;
      }
      return false;
   }
    
   static botMoveFunc () {
      if (players[this.toMove].player.type === "bot")
         // if (this.result and tournament mode
         if (this.result) console.info("Game ended");
         else players[this.toMove].player.play();
      else
         console.info("Player must've changed into a human");
   }
}
