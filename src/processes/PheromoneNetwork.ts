import { Kernel } from '../components/Kernel'
import { PheromoneNetwork } from '../components/PheromoneNetwork'
import { Process } from '../components/Process'
import * as Config from '../config/config'
import { registerProcess } from '../decorators/registerProcess'

const DECAY_RATE = 1

@registerProcess
export class PheromoneNetworkProcess extends Process {
  public static start() {
    const proc = new PheromoneNetworkProcess(0)
    Kernel.addProcess(proc)
    return proc.pid
  }

  public run() {
    // Decay
    for (const pheromoneType in PheromoneNetwork.layers) {
      for (const roomName in PheromoneNetwork.layers[pheromoneType]) {
        const decayTimes = PheromoneNetwork.layers[pheromoneType][roomName].decayTimes
        for (const xy in decayTimes) {
          if (decayTimes[xy] > 0) { decayTimes[xy]-- }
          if (decayTimes[xy] < 1) {
            let [x, y]: Array<number | string> = xy.split(',')
            x = parseInt(x, 10)
            y = parseInt(y, 10)
            const currentLevel = PheromoneNetwork.getTypeLevelAt(pheromoneType, x, y, roomName)
            if (currentLevel === 0) { continue }
            const newLevel = currentLevel - DECAY_RATE
            PheromoneNetwork.setTypeLevelAt(pheromoneType, newLevel, x, y, roomName)
            if (newLevel < 1) {
              delete PheromoneNetwork.layers[pheromoneType][roomName].decayTimes[xy]
            } else {
              PheromoneNetwork.layers[pheromoneType][roomName].decayTimes[xy] = Config.PHEROMONE_DECAY_TIME
            }
          }
        }
      }
    }
  }
}
