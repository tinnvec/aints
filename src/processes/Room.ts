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
      let color: string | undefined
      if (pheromoneType === 'energy') { color = '#FFE87B' }
      cm.draw(this.memory.roomName, color)
    }
  }
}
