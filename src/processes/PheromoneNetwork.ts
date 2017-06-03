import { Kernel } from '../components/Kernel'
import { PheromoneNetwork } from '../components/PheromoneNetwork'
import { Process } from '../components/Process'
import * as Config from '../config/config'
import { registerProcess } from '../decorators/registerProcess'

@registerProcess
export class PheromoneNetworkProcess extends Process {
  public static start() {
    const proc = new PheromoneNetworkProcess(0)
    Kernel.addProcess(proc)
    return proc.pid
  }

  public run() {
    if (Game.time % Config.PHEROMONE_DECAY_TIME === 0) {
      PheromoneNetwork.decay()
    }
  }
}
