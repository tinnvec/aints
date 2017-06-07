export class Stats {
  public static collect() {
    Memory.stats = { cpu: {}, gcl: {}, rooms: {}, time: Game.time }

    // Collect room stats
    for (const roomName in Game.rooms) {
      const room = Game.rooms[roomName]
      const isMyRoom = (room.controller ? room.controller.my : false)
      if (isMyRoom) {
        const roomStats: any = Memory.stats.rooms[roomName] = {}
        roomStats.storageEnergy           = (room.storage ? room.storage.store.energy : 0)
        roomStats.terminalEnergy          = (room.terminal ? room.terminal.store.energy : 0)
        roomStats.energyAvailable         = room.energyAvailable
        roomStats.energyCapacityAvailable = room.energyCapacityAvailable
        roomStats.controllerProgress      = room.controller!.progress
        roomStats.controllerProgressTotal = room.controller!.progressTotal
        roomStats.controllerLevel         = room.controller!.level
      }
    }

    // Collect GCL stats
    Memory.stats.gcl.progress      = Game.gcl.progress
    Memory.stats.gcl.progressTotal = Game.gcl.progressTotal
    Memory.stats.gcl.level         = Game.gcl.level

    // Collect CPU stats
    Memory.stats.cpu.bucket        = Game.cpu.bucket
    Memory.stats.cpu.limit         = Game.cpu.limit
    Memory.stats.cpu.used          = Game.cpu.getUsed()
  }
}
