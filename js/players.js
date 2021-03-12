import { ERRORS, BotIsDisabledError } from './errors.js'
import { Position } from './game.js'

export const player_assets = [
   'assets/players/x.png',
   'assets/players/o.png',
   'assets/players/triangle.png',
   'assets/players/square.png',
   'assets/players/pentagon.png'
]

export const PLAYER_CHARS = 'xovnp'

export const PLAYER_BORDERS = [
   'red',
   'dodgerblue',
   'green',
   '#ffd74a',
   'purple'
]

export const PLAYER_NAMES = [
   'x',
   'o',
   'triangle',
   'square',
   'pentagon'
]

/**
 * ...I just thought of something. PlayerBase
 */
export class Player {
   constructor (type, name, disabled) {
      this.type = type
      this.name = name
      this.disabled = disabled
      this.lastMove = null
   }
}

export const Defaults = {
   ratingInterval: 400,
   ratingValue: 1500,
   ratingK: 500
}

class Rating {
   constructor (player) {
      this.value = Defaults.ratingValue
      this.lastCertainty = 0
      this.player = player
   }

   /**
    * Returns 1 - (1 / n)
    * where n = 1 + Σ(log_totalPlayers(player total games))
    */
   get certainty () {
      const totalGames = Object.values(this.player.playedAgainst)
         .reduce((accum, curr) => accum + curr, 0)
      const n = 1 + (Math.log(Player.totalPlayers) / Math.log(totalGames))
      return 1 - (1 / n)
   }

   /** Gets the expected outcome when playing against some other rating */
   expectedOutcome (rating) {
      return 1 / (1 + (10 ** ((rating.value - this.value) / Defaults.ratingInterval)))
   }

   /** */
   static expectedOutcome (ratingA, ratingB) {
      if (ratingA instanceof Rating && ratingB instanceof Rating) {
         return ratingA.expectedOutcome(ratingB)
      }

      return 1 / (1 + (10 ** ((ratingB - ratingA) / Defaults.ratingInterval)))
   }
}

class Version {
   // prerelease is only a suggestion. It's the part after a hyphen
   // metadata is only a suggestion. It's the part after a minus sign.
   constructor (major, minor, patch, prerelease, metadata) {
      this.major = major
      this.minor = minor
      this.patch = patch
      this.prerelease = prerelease ?? null
      this.metadata = metadata ?? null
   }

   toString () {
      let string = `${this.major}.${this.minor}.${this.patch}`
      if (this.prerelease !== null) {
         string += `+${this.prerelease}`
      }
      if (this.metadata !== null) {
         string += `-${this.metadata}`
      }
      return string
   }
}

export class RatablePlayer extends Player {
   static PlayerBase = []

   constructor (type, number, disabled) {
      super(type, number, disabled)
      this.id = RatablePlayer.PlayerBase.push(this) // === playerBase.length
      this.games = []
      this.rating = new Rating(this)
      this.playedAgainst = {}
      Player.totalPlayers++
   }
}

class Human extends Player {
   constructor (name, disabled = true) {
      super('human', name, disabled)
   }
}

class Bot extends RatablePlayer {
   static totalBots = 0

   constructor (name, mechanics, version) {
      super('bot', name, false)
      this.mechanics = mechanics
      this.version = version
   }

   play (game, ...params) {
      if (this.disabled) { throw new BotIsDisabledError(this) }
      return this.mechanics.apply(game, ...params)
   }
}

export class PlayerReference {
   constructor (type, index) {
      if (type === 'human' && people.length <= index) {
         throw new ReferenceError(`Person at index ${index} doesn't exist`)
      } else if (type === 'bot' && bots.length <= index) {
         throw new ReferenceError(`Bot at index ${index} doesn't exist`)
      }

      this.type = type
      this.index = index
   }

   get player () {
      if (this.type === 'human') {
         return people[this.index]
      } else {
         return bots[this.index]
      }
   }

   set disabled (isDisabled) {
      this.player.disabled = isDisabled
   }

   get disabled () {
      return this.player.disabled
   }
}

const bot_mechanics = {
   /** Chooses a random move */
   random_move () {
      const moves = this.getMoves()
      const chosen = moves[Math.floor(Math.random() * moves.length)]
      this.play(chosen.x, chosen.y)
   },
   /** Choosen the median move out of the list of moves */
   middle_index () {
      const moves = this.getMoves()
      let chosen

      // a b c --> length: 3, index: 1
      // a b c d --> length: 4, index: 1 or 2
      if (moves.length % 2 === 1) { chosen = moves[(moves.length - 1) / 2] } else {
         chosen = moves[
            Math.random() < 0.5
               ? moves.length / 2
               : (moves.length / 2) - 1
         ]
      }
      this.play(chosen.x, chosen.y)
   },
   /** Copies the index of the move you just played */
   copy () {
      const moves = this.getMoves()
      const lastMove = this.moveHistory?.[this.moveHistory.length - 1]
      const positionOfLastMove = lastMove?.originalPosition

      if (lastMove === undefined) { bot_mechanics.random_move.apply(this) } else {
         const indexOfLastMove = lastMove.gameState
            .originalMoves
            .findIndex(
               position => position.x === positionOfLastMove.x &&
                  position.y === positionOfLastMove.y
            )

         if (indexOfLastMove === -1) { ERRORS.IMPOSSIBLE_LAST_MOVE.rethrow() }
         const chosen = moves[indexOfLastMove]
         this.play(chosen.x, chosen.y)
      }
   },
   /** Tries to avoid the previous moves */
   avoider () {
      const moves = this.getMoves()
      let best_moves = [-Infinity, []]
      for (const move of moves) {
         let score = 0
         for (const historicalMove of this.moveHistory) {
            score += historicalMove.updatedDistance(move) // More distance
         }

         if (score === best_moves[0]) {
            best_moves[1].push(move)
         } else if (score > best_moves[0]) {
            best_moves = [score, [move]]
         }
      }

      const chosen = best_moves[1][Math.floor(Math.random() * best_moves[1].length)]
      this.play(chosen.x, chosen.y)
   },
   /** Makes the previous moves uncomfortable */
   closer () {
      const moves = this.getMoves()
      let best_moves = [-Infinity, []]
      for (const move of moves) {
         let score = 100_000 // Positive number --> Easier score tracking
         for (const historicalMove of this.moveHistory) {
            score -= historicalMove.updatedDistance(move) // Less distance
            if (score < best_moves[0]) { break }
         }

         if (score === best_moves[0]) {
            best_moves[1].push(move)
         } else if (score > best_moves[0]) {
            best_moves = [score, [move]]
         }
      }

      const chosen = best_moves[1][Math.floor(Math.random() * best_moves[1].length)]
      this.play(chosen.x, chosen.y)
   },
   /** Makes moves on the diagonal containing the corresponding square of 0, 0 */
   firstDiagonal () {
      let positionOnDiagonal
      if (this.moveHistory.length) {
         const move = this.moveHistory[0]
         positionOnDiagonal = move.correspondingPosition

         if ((move.x + move.y) % 2 === 1) { positionOnDiagonal.x++ }
      } else {
         positionOnDiagonal = new Position(0, 0)
      }

      const moves = this.getMoves().filter(
         move => (positionOnDiagonal.x + positionOnDiagonal.y + move.x + move.y) % 2 === 0
      )
      if (moves.length === 0) { bot_mechanics.random_move.apply(this) } else {
         const chosen = moves[Math.floor(Math.random() * moves.length)]
         this.play(chosen.x, chosen.y)
      }
   },
   /** Makes any move that's next to itself */
   next2self () {
      const self = []
      for (let y = 0; y < this.board.height; y++) {
         for (let x = 0; x < this.board.width; x++) {
            if (this.board[y][x].value === PLAYER_CHARS[this.toMove]) { self.push(new Position(x, y)) }
         }
      }

      const nextSelfMoves = this.getMoves().filter(
         move => self.some(
            selfTile => Math.abs(selfTile.x - move.x) < 2 &&
               Math.abs(selfTile.y - move.y) < 2
         )
      )
      if (nextSelfMoves.length === 0) {
         bot_mechanics.random_move.apply(this)
      } else {
         const chosen = nextSelfMoves[Math.floor(Math.random() * nextSelfMoves.length)]
         this.play(chosen.x, chosen.y)
      }
   }
}

const bot_versions = {
   random_move: new Version(1, 0, 0),
   middle_index: new Version(1, 0, 0),
   copy: new Version(1, 0, 0),
   avoider: new Version(1, 0, 0),
   closer: new Version(1, 0, 0),
   firstDiagonal: new Version(1, 0, 0),
   next2self: new Version(1, 0, 0)
}

// TODO: Huh? It's used though...
globalThis.activeBots = 1
globalThis.activePeople = 1
globalThis.activePlayers = 2

globalThis.people = [
   new Human('Person 1'),
   new Human('Person 2'),
   new Human('Person 3'),
   new Human('Person 4')
]

globalThis.bots = []
for (const key of Object.keys(bot_mechanics)) {
   const newBot = new Bot(key, bot_mechanics[key], bot_versions[key])

   bots.push(newBot)
   bots[key] = newBot
}

globalThis.players = [
   new PlayerReference('human', 0),
   new PlayerReference('bot', 0)
]
