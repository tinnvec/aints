import * as Config from './config/config'

import * as Profiler from 'screeps-profiler'
import { log } from './lib/logger/log'

import './components/Structure'
import './components/StructureSpawn'

// This is an example for using a config variable from `config.ts`.
// NOTE: this is used as an example, you may have better performance
// by setting USE_PROFILER through webpack, if you want to permanently
// remove it on deploy
// Start the profiler
if (Config.USE_PROFILER) {
  Profiler.enable()
}

log.info(`loading revision: ${ __REVISION__ }`)

function mloop() {
  for (const name in Memory.structures) {
    if (!Game.structures[name]) {
      log.info(`Clearing non-existing structure from memory: ${name}`)
      Memory.structures[name] = undefined
    }
  }

  }

    }
  }
  // Run all game objects
  _.invoke(Game.structures, 'run')
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
