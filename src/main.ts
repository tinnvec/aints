import { Kernel } from './components/Kernel'
import { log } from './lib/logger/log'

import './prototypes/Pathfinder.CostMatrix'
import './prototypes/Room'

log.info(`loading revision: ${ __REVISION__ }`)

export function loop() {
  Kernel.load()
  Kernel.run()
  Kernel.save()
}
