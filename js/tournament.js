
import { Game, ELEMENTS } from './game.js'
import { RatablePlayer, PlayerReference, Defaults } from './players.js'

const NON_TOURNAMENT_BOT_MOVE_FUNC = Game.prototype.doBotMove
const PlayerFields = Array.from(document.querySelectorAll('#choosePlayerFields select'))
const tournaments = []

// participants is sometimes used instead of 'players' to avoid shadowing
// players = all players
// participants = not necessarily all players
class RatedGame {
   static totalGames = 0

   constructor (participantPlayers, id) {
      this.id = id ?? RatedGame.totalGames
      this.players = participantPlayers
      this.startTime = null
      this.finishTime = null
      this.result = null
      RatedGame.totalGames++

      for (const player of participantPlayers) {
         if (!player.games.includes(this)) {
            player.games.push(this)
         }
      }
   }

   // is this really a rated game?
   get valid () {
      return this.players.length === [...new Set(this.players)].length
   }

   // If you change this you might want to change TournamentGame#update
   update (code, result) {
      if (code === 'start') {
         return (this.startTime = Date.now()) // Intentional assignment return
      } else if (code === 'finish') {
         this.result = result
         this.updatePlayerRatings()
      }
   }

   updatePlayerRatings () {
      if (!this.valid) {
         return
      }
      if (this.result === null) {
         throw new TypeError('No result yet!')
      }

      for (const playerA of this.players) {
         for (const playerB of this.players) {
            if (playerA === playerB) {
               continue
            }

            if (playerB.id in playerA.playedAgainst) {
               playerA.playedAgainst[playerB.id]++
            } else {
               playerA.playedAgainst[playerB.id] = 1
            }

            if (playerA.id in playerB.playedAgainst) {
               playerB.playedAgainst[playerA.id]++
            } else {
               playerB.playedAgainst[playerA.id] = 1
            }
         }
      }

      const expected = this.players.map(player => {
         let totalExpected = 0
         for (const player2 of this.players) {
            if (player2 === player) {
               continue
            }
            totalExpected += player.rating.expectedOutcome(player2.rating)
         }
         // Thanks internet
         return (totalExpected / (
            RatablePlayer.totalPlayers * (RatablePlayer.totalPlayers - 1) / 2)
         )
      })

      const lastCertainty = this.players.map(player => player.rating.lastCertainty)
      const certainty = this.players.map(player => player.rating.certainty)

      for (let i = 0; i < this.players.length; i++) {
         const halfWayCertainty = (lastCertainty[i] + certainty[i]) / 2
         this.players[i].rating.value += Defaults.ratingK * (this.result[i] - expected[i]) * (1 - halfWayCertainty)
         this.players[i].rating.lastCertainty = certainty[i]
      }

      console.assert(
         expected.reduce((accum, curr) => accum + curr) > 0.99999 &&
         expected.reduce((accum, curr) => accum + curr) < 1.00001,
         expected.reduce((accum, curr) => accum + curr),
         this.players,
         this.result
      )
   }
}

/**
 * Wraps Game
 */
class TournamentGame extends RatedGame {
   constructor (dict) {
      const gameParticipants = dict.players.map(id => bots[id]) // referring to global "bots" from players.js

      super(gameParticipants)
      this.game = dict.game
      this.botIDs = dict.players
      this.bots = gameParticipants
   }

   get result () {
      if (this.game.result === null) {
         return null
      } else if (this.game.result === 'draw') {
         return [0.5, 0.5]
      } else if (this.game.winners[0][2] === this.bots[0]) {
         return [1, 0]
      } else {
         return [0, 1]
      }
   }

   set result (_value) {
      // TournamentGame has a getter for its' result so there's no need to update it
   }

   // Optimized for TournamentGames
   // See RatedGame#update
   update (code) {
      if (code === 'start') {
         return (this.startTime = Date.now()) // Intentional assignment return
      } else if (code === 'finish') {
         if (this.bots[0] !== this.bots[1]) {
            this.updatePlayerRatings()
         }
      }
   }
}

class TournamentGameList extends Array {
   constructor (tournament) {
      super()
      this.tournament = tournament
   }

   add (dictOrGame) {
      if (dictOrGame instanceof TournamentGame) {
         this.push(dictOrGame)
      } else {
         this.push(new TournamentGame(dictOrGame))
      }
   }

   get results () {
      const table = {}

      for (const tournamentGame of this) {
         const gameResult = tournamentGame.result
         if (gameResult === null) {
            return null
         } else if (gameResult === 'draw') {
            table[tournamentGame.bots[0].name] ??= {}
            table[tournamentGame.bots[0].name][tournamentGame.bots[1].name] ??= { wins: 0, draws: 0, losses: 0 }
            table[tournamentGame.bots[0].name][tournamentGame.bots[1].name].draws++

            table[tournamentGame.bots[1].name] ??= {}
            table[tournamentGame.bots[1].name][tournamentGame.bots[0].name] ??= { wins: 0, draws: 0, losses: 0 }
            table[tournamentGame.bots[1].name][tournamentGame.bots[0].name].draws++
         } else { // gameResult = {winner: bot, loser: bot}
            table[tournamentGame.bots[0].name] ??= {}
            table[tournamentGame.bots[0].name][tournamentGame.bots[1].name] ??= { wins: 0, draws: 0, losses: 0 }
            table[tournamentGame.bots[0].name][tournamentGame.bots[1].name].wins++

            table[tournamentGame.bots[1].name] ??= {}
            table[tournamentGame.bots[1].name][tournamentGame.bots[0].name] ??= { wins: 0, draws: 0, losses: 0 }
            table[tournamentGame.bots[1].name][tournamentGame.bots[0].name].losses++
         }
      }

      return table
   }
}

export class Tournament {
   constructor (rounds, display = true, interval = 4000) {
      if (typeof rounds !== 'number') {
         throw new TypeError('Rounds must be a number')
      }
      if (Number.isNaN(rounds)) {
         throw new TypeError('NaN Rounds?? Not a number.')
      }
      if (!Number.isInteger(rounds)) {
         throw new TypeError('Integer amount of rounds required')
      }
      if (rounds <= 0) {
         throw new RangeError('Tournament must be at least 1 round long')
      }

      this.currentBots = [0, 0]
      this.rounds = rounds
      this.currentRound = 0

      this.games = new TournamentGameList(this)
      this.currentGame = null

      this.interval = interval
      this.intervalID = null
      this.intervalCalls = 0 // Purely for debugging
      this.previousIntervals = []

      this.isDisplayed = display
      this.finished = false
   }

   start () {
      console.info('Tournament started')
      console.info('Round 0 started')

      this.intervalID = setInterval(this.tournamentInterval.bind(this), this.interval)
   }

   finish () {
      this.finished = this.waitForLastGame()

      if (this.finished) {
         console.info('Tournament finished')
         clearInterval(this.intervalID)
         this.previousIntervals.push(this.intervalID)
         this.intervalID = null
         this.currentGame.doBotMove = NON_TOURNAMENT_BOT_MOVE_FUNC
         tournaments.push(this)
      }
   }

   forceStop () {
      console.info('Tournament force finished')
      clearInterval(this.intervalID)
      this.previousIntervals.push(this.intervalID)
      this.intervalID = null
      this.currentGame.doBotMove = NON_TOURNAMENT_BOT_MOVE_FUNC
      tournaments.push(this)
   }

   pause () {
      clearInterval(this.intervalID)
      this.previousIntervals.push(this.intervalID)
      this.intervalID = null
   }

   unpause () {
      this.intervalID = setInterval(this.tournamentInterval.bind(this), this.interval)
   }

   /* Returns true when last game is finished */
   waitForLastGame () {
      if (!this.currentGame.result) {
         return false
      }
      PlayerFields[0].selectedIndex = 0
      PlayerFields[0].dispatchEvent(new Event('change'))
      return true
   }

   tournamentInterval () {
      this.intervalCalls++

      if (this.currentBots[0] === bots.length) {
         console.info(`Round ${this.currentRound} finished.`)
         if (this.currentRound >= this.rounds) {
            this.finish()
            this.currentRound++
         } else if (this.currentGame.result) {
            console.info(`Round ${this.currentRound} started.`)
            this.currentBots = [0, 0]
            this.currentRound++
         } // else wait until currentGame is finished

         return
      }

      // Only start a new game if the previous game is finished or there are no games
      if (this.currentGame === null || this.currentGame.result) {
         if (this.games.length !== 0) {
            this.games[this.games.length - 1].update('finish')
            this.stopLastGame()
         }

         this.startNewGame()

         this.currentBots[1]++
         if (this.currentBots[1] === bots.length) {
            this.currentBots[1] = 0
            this.currentBots[0]++
            if (this.currentBots[0] === bots.length) {
               return true
            }
         }
         return false
      }
   }

   stopLastGame () {
      if (this.isDisplayed) {
         PlayerFields[0].selectedIndex = 0
         PlayerFields[0].dispatchEvent(new Event('change'))

         if (this.games.length !== 0) {
            ELEMENTS.resetGameButton.click()
         }
      } else {
         if (this.games.length !== 0) {
            this.currentGame.play = function dontPlayAnymoreMoves () { }
         }
      }
   }

   startNewGame () {
      if (this.isDisplayed) {
         PlayerFields[0].selectedIndex = 4 + this.currentBots[0]
         PlayerFields[1].selectedIndex = 4 + this.currentBots[1]
         PlayerFields[1].dispatchEvent(new Event('change'))
         PlayerFields[0].dispatchEvent(new Event('change'))

         this.currentGame = currentGame
      } else {
         this.currentGame = new Game([
            new PlayerReference('bot', this.currentBots[0]),
            new PlayerReference('bot', this.currentBots[1])
         ], false)
         this.currentGame.playBots()
      }

      this.currentGame.doBotMove = Tournament.botMoveFunc
      this.games.add({ game: this.currentGame, players: [this.currentBots[0], this.currentBots[1]] })
      this.games[this.games.length - 1].update('start')
   }

   static botMoveFunc () {
      if (this.playerToMove.player.type === 'bot' && !this.result) {
         this.playerToMove.player.play(this)
      } else {
         console.info("Player must've changed into a human")
      }
   }
}
