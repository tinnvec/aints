import { Kernel } from '../components/Kernel'
import { Process, ProcessPriority } from '../components/Process'
import { registerProcess } from '../decorators/registerProcess'

import { CreepProcess } from './Creep'
import { PheromoneNetworkProcess } from './PheromoneNetwork'
import { RoomProcess } from './Room'
import { SpawnProcess } from './Spawn'

@registerProcess
export class InitProcess extends Process {
  public static start() {
    const proc = new InitProcess(0, 0, ProcessPriority.High)
    Kernel.addProcess(proc)
    return proc.pid
  }

  public run() {
    this.memory.pidList = this.memory.pidList || {}

    if (this.memory.pidList.pheromoneNetwork === undefined) {
      this.memory.pidList.pheromoneNetwork = PheromoneNetworkProcess.start()
    }

    this.memory.pidList.spawns = this.memory.pidList.spawns || {}

    for (const spawnName in this.memory.pidList.spawns) {
      if (Game.spawns[spawnName] === undefined) { this.memory.pidList.spawns[spawnName] = undefined }
    }

    for (const spawnName in Game.spawns) {
      const pid = this.memory.pidList.spawns[spawnName]
      if (pid === undefined) { this.memory.pidList.spawns[spawnName] = SpawnProcess.start(spawnName) }
    }

    this.memory.pidList.creeps = this.memory.pidList.creeps || {}

    for (const creepName in this.memory.pidList.creeps) {
      if (Game.creeps[creepName] === undefined) { this.memory.pidList.creeps[creepName] = undefined }
    }

    for (const creepName in Game.creeps) {
      const pid = this.memory.pidList.creeps[creepName]
      if (pid === undefined) { this.memory.pidList.creeps[creepName] = CreepProcess.start(creepName) }
    }

    this.memory.pidList.rooms = this.memory.pidList.rooms || {}

    for (const roomName in this.memory.pidList.rooms) {
      if (Game.rooms[roomName] === undefined) { this.memory.pidList.rooms[roomName] = undefined }
    }

    for (const roomName in Game.rooms) {
      const pid = this.memory.pidList.rooms[roomName]
      if (pid === undefined) { this.memory.pidList.rooms[roomName] = RoomProcess.start(roomName) }
    }
  }
}
