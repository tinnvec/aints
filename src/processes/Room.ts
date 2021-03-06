import { Kernel } from '../components/Kernel'
import { PheromoneNetwork } from '../components/PheromoneNetwork'
import { Process } from '../components/Process'
import * as Config from '../config/config'
import { registerProcess } from '../decorators/registerProcess'

@registerProcess
export class RoomProcess extends Process {
  public static start(roomName: string) {
    const proc = new RoomProcess(0)
    Kernel.addProcess(proc)
    proc.memory.roomName = roomName
    Kernel.storeProcessTable()
    return proc.pid
  }

  public run() {
    const room = Game.rooms[this.memory.roomName]
    if (room === undefined) { return Kernel.killProcess(this.pid) }
    if (Config.ENABLE_ROOM_VISUALS) { this.draw() }
  }

  private draw() {
    for (const pheromoneType in PheromoneNetwork.layers) {
      if (PheromoneNetwork.layers[pheromoneType][this.memory.roomName] === undefined) { continue }
      const cm = PheromoneNetwork.layers[pheromoneType][this.memory.roomName].levels
      if (cm === undefined) { continue }
      const color =
        pheromoneType === 'energy' ? '#FFE87B' :
        pheromoneType === 'controller' ? '#386CA7' :
        '#CCCCCC'

      const vis = new RoomVisual(this.memory.roomName)
      let x: number
      let y: number
      for (y = 0; y < 50; ++y) {
        for (x = 0; x < 50; ++x) {
          const str = cm.get(x, y)
          if (str < 1) { continue }
          vis.circle(x, y, {
            fill: color,
            opacity: 0.33,
            radius: str / (Config.PHEROMONE_MAX_TILE_AMOUNT * 2),
            stroke: color,
            strokeWidth: 0.1,
          })
        }
      }
    }
  }
}
