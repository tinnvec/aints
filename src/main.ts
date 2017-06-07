import { Kernel } from './components/Kernel'
import { Stats } from './components/Stats'

import { log } from './lib/logger/log'

import './prototypes/Room'

log.info(`loading revision: ${ __REVISION__ }`)

export function loop() {
  Kernel.load()
  Kernel.run()
  Kernel.save()
  Stats.collect()
}
