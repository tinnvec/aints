import * as Profiler from 'screeps-profiler'
import * as Config from './config/config'
import { log } from './lib/logger/log'
import Stats from './lib/stats/Stats'

import './components/Creep'
import './components/Room'
import './components/Structure'
import './components/StructureSpawn'

// This is an example for using a config variable from `config.ts`.
// NOTE: this is used as an example, you may have better performance by setting USE_PROFILER through webpack, if you
// want to permanently remove it on deploy
// Start the profiler
if (Config.USE_PROFILER) { Profiler.enable() }

log.info(`loading revision: ${ __REVISION__ }`)

function mloop() {
  Stats.init()

  for (const name in Memory.structures) {
    if (!Game.structures[name]) {
      log.info(`Clearing non-existing structure from memory: ${name}`)
      Memory.structures[name] = undefined
    }
  }

  for (const name in Memory.creeps) {
    if (!Game.creeps[name]) {
      log.info(`Clearing non-existing creep from memory: ${name}`)
      Memory.creeps[name] = undefined
    }
  }

  // Run all game objects
  _.invoke(Game.rooms, 'run')
  _.invoke(Game.structures, 'run')
  _.invoke(Game.creeps, 'run')

  // Save Room memory
  _.invoke(Game.rooms, 'store')

  Stats.collect()

  if (Config.ENABLE_PHEROMONE_VISUALS) {
    // Draw Rooms
    _.invoke(Game.rooms, 'draw')
  }

  Stats.collectFinalCPU()
}

/**
 * Screeps system expects this "loop" method in main.js to run the
 * application. If we have this line, we can be sure that the globals are
 * bootstrapped properly and the game loop is executed.
 * http://support.screeps.com/hc/en-us/articles/204825672-New-main-loop-architecture
 *
 * @export
 */
export const loop = !Config.USE_PROFILER ? mloop : Profiler.wrap(mloop)
