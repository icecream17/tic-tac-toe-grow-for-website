import {} from './errors.js'
import {} from './game.js'
import {} from './players.js'
import {} from './tabs.js'
import { Tournament } from './tournament.js'
import {} from './utils.js'

export const moduleGlobals = {
   Tournament,
   bots
}

// So that module globals can be used in the console
Object.assign(globalThis, moduleGlobals)
