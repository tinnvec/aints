
import * as Profiler from "screeps-profiler";
import { log } from "./lib/logger/log";

// This is an example for using a config variable from `config.ts`.
// NOTE: this is used as an example, you may have better performance
// by setting USE_PROFILER through webpack, if you want to permanently
if (Config.USE_PROFILER) {
// Start the profiler
// remove it on deploy
  Profiler.enable();
}

log.info(`loading revision: ${ __REVISION__ }`);
function mloop() {

  }

    }
  }
}

/**
 * Screeps system expects this "loop" method in main.js to run the
 * application. If we have this line, we can be sure that the globals are
 * bootstrapped properly and the game loop is executed.
 * http://support.screeps.com/hc/en-us/articles/204825672-New-main-loop-architecture
 *
 * @export
 */
export const loop = !Config.USE_PROFILER ? mloop : Profiler.wrap(mloop);
