import * as errors from './errors.js'
import * as game from './game.js'
import * as players from './players.js'
import * as tabs from './tabs.js'
import * as tournament from './tournament.js'
import * as utils from './utils.js'

export const imports = {
   errors, game, players, tabs, tournament, utils
}

// So that module globals can be used in the console
Object.assign(globalThis, imports)
