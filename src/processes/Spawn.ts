import { Kernel } from '../components/Kernel'
import { Process, ProcessPriority } from '../components/Process'
import { registerProcess } from '../decorators/registerProcess'

const CREEP_BODY = [MOVE, MOVE, WORK, CARRY, MOVE]

@registerProcess
export class SpawnProcess extends Process {
  public static start(spawnName: string) {
    const proc = new SpawnProcess(0, undefined, ProcessPriority.Normal)
    Kernel.addProcess(proc)
    proc.memory.spawnName = spawnName
    Kernel.storeProcessTable()
    return proc.pid
  }

  public run() {
    const spawn = Game.spawns[this.memory.spawnName]
    if (spawn === undefined) { return Kernel.killProcess(this.pid) }
    spawn.createCreep(CREEP_BODY)
  }
}
