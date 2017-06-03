import { InitProcess } from '../processes/Init'
import { PheromoneNetwork } from './PheromoneNetwork'
import { Process, ProcessStatus } from './Process'
import { ProcessRegistry } from './ProcessRegistry'

export class Kernel {
  public static processTable: { [pid: string]: Process } = {}

  public static addProcess<T extends Process>(process: T) {
    this.processTable[process.pid] = process
    process.setMemory(this.getProcessMemory(process.pid))
    process.status = ProcessStatus.Alive
  }

  public static getNextPID() {
    Memory.pidCounter = Memory.pidCounter || 0
    while (this.getProcessByPID(Memory.pidCounter) !== undefined) {
      if (Memory.pidCounter >= Number.MAX_SAFE_INTEGER) { Memory.pidCounter = 0 }
      Memory.pidCounter++
    }
    return Memory.pidCounter
  }

  public static getProcessByPID(pid: number) {
    return this.processTable[pid]
  }

  public static getProcessMemory(pid: number) {
    Memory.processMemory = Memory.processMemory || {}
    Memory.processMemory[pid] = Memory.processMemory[pid] || {}
    return Memory.processMemory[pid]
  }

  public static killProcess(pid: number) {
    if (pid === 0) { return } // Can't kill process 0
    // Kill children
    for (const otherPid in this.processTable) {
      const process = this.processTable[otherPid]
      if (process.parentPID === pid && process.status !== ProcessStatus.Dead) { this.killProcess(process.pid) }
    }
    // Kill process
    this.processTable[pid].status = ProcessStatus.Dead
    Memory.processMemory[pid] = undefined
  }

  public static load() {
    this.loadPheromoneNetwork()
    this.loadProcessTable()
    this.garbageCollection()
    if (this.getProcessByPID(0) === undefined) { InitProcess.start() }
  }

  public static run() {
    while (this.queue.length > 0) {
      let process = this.queue.pop()
      while (process !== undefined) {
        if (this.getProcessByPID(process.parentPID) === undefined) {
          this.killProcess(process.pid)
        }
        if (process.status === ProcessStatus.Alive) { process.run() }
        process = this.queue.pop()
      }
    }
  }

  public static save() {
    this.storePheromoneNetwork()
    this.storeProcessTable()
  }

  private static queue: Process[] = []

  private static garbageCollection() {
    Memory.processMemory = _.pick(Memory.processMemory, (_: any, k: string) => this.processTable[k] !== undefined)
  }

  private static loadPheromoneNetwork() {
    Memory.pheromoneNetwork = Memory.pheromoneNetwork || {}
    Memory.pheromoneNetwork.layers = Memory.pheromoneNetwork.layers || {}
    for (const layerName in Memory.pheromoneNetwork.layers) {
      for (const roomName in Memory.pheromoneNetwork.layers[layerName]) {
        PheromoneNetwork.layers[layerName][roomName] =
          PathFinder.CostMatrix.deserialize(Memory.pheromoneNetwork.layers[layerName][roomName])
      }
    }
  }

  private static loadProcessTable() {
    this.processTable = {}
    this.queue = []
    Memory.processTable = Memory.processTable || []
    for (const [pid, parentPID, processName, priority] of Memory.processTable) {
      const processClass = ProcessRegistry.fetch(processName)
      if (processClass === undefined) { continue }
      const memory = this.getProcessMemory(pid)
      const process = new processClass(parentPID, pid, priority)
      process.setMemory(memory)
      this.processTable[pid] = process
      this.queue.push(process)
    }
  }

  private static storePheromoneNetwork() {
    for (const layerName in PheromoneNetwork.layers) {
      for (const roomName in PheromoneNetwork.layers[layerName]) {
        Memory.pheromoneNetwork.layers[layerName][roomName] = PheromoneNetwork.layers[layerName][roomName].serialize()
      }
    }
  }

  private static storeProcessTable() {
    const liveProcs = _.filter(this.processTable, (p) => p.status !== ProcessStatus.Dead)
    Memory.processTable = _.map(liveProcs, (p) => [p.pid, p.parentPID, p.constructor.name, p.priority])
  }
}
