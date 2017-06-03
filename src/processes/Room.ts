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
    return proc.pid
  }

  public run() {
    const room = Game.rooms[this.memory.roomName]
    if (room === undefined) { return Kernel.killProcess(this.pid) }
    if (Config.ENABLE_ROOM_VISUALS) { this.draw() }
  }

  private draw() {
    for (const pheromoneType in PheromoneNetwork.layers) {
      const cm = PheromoneNetwork.layers[pheromoneType][this.memory.roomName]
      if (cm === undefined) { continue }
      let color = '#CCCCCC'
      if (pheromoneType === 'energy') { color = '#FFE87B' }
      const vis = new RoomVisual(this.memory.roomName)
      let x: number
      let y: number
      for (y = 0; y < 50; ++y) {
        for (x = 0; x < 50; ++x) {
          const str = cm.get(x, y)
          if (str > 0) {
            vis.circle(x, y, {
              fill: color,
              opacity: 0.33,
              radius: str / (255 * 2),
              stroke: color,
              strokeWidth: 0.1,
            })
          }
        }
      }
    }
  }
}
