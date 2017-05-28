import Profile from '../screeps-profiler/Profile'

@Profile
export default class Stats {
  public static collect() {
    Memory.stats.cpu = Game.cpu
    Memory.stats.cpu.start = this._cpuStart
    Memory.stats.gcl = Game.gcl
    Memory.stats.memory = { size: RawMemory.get().length }
    const creeps = _.filter(Game.creeps, (c) => c.my)
    Memory.stats.creeps = {
      count: creeps !== undefined ? creeps.length : 0
    }
    for (const roomName in Game.rooms) {
      this.collectRoomInfo(roomName)
    }
  }

  public static collectFinalCPU() {
    Memory.stats.cpu.used = Game.cpu.getUsed()
  }

  public static collectRoomInfo(roomName: string): any {
    if (Memory.stats.room === undefined) { Memory.stats.room = {} }
    if (Memory.stats.room[roomName] === undefined) { Memory.stats.room[roomName] = {} }
    const room = Game.rooms[roomName]
    if (room.controller === undefined || !room.controller.my) {
      Memory.stats.room[roomName].myRoom = undefined
      return
    }
    Memory.stats.room[roomName].myRoom = 1
    Memory.stats.room[roomName].energyAvailable = room.energyAvailable
    Memory.stats.room[roomName].energyCapacityAvailable = room.energyCapacityAvailable
    Memory.stats.room[roomName].controllerProgress = room.controller.progress
    Memory.stats.room[roomName].controllerProgressTotal = room.controller.progressTotal
    Memory.stats.room[roomName].storedEnergy = 0
    if (room.storage !== undefined) {
      Memory.stats.room[roomName].storedEnergy = room.storage.store.energy || 0
    }
  }

  public static init() {
    if (Memory.stats === undefined) { Memory.stats = {} }
    Memory.stats.tick = Game.time
    this._cpuStart = Game.cpu.getUsed()
  }

  private static _cpuStart: number
}
