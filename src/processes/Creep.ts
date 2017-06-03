import { Kernel } from '../components/Kernel'
import { Process } from '../components/Process'
import { registerProcess } from '../decorators/registerProcess'

@registerProcess
export class CreepProcess extends Process {
  public static start(creepName: string) {
    const proc = new CreepProcess(0)
    Kernel.addProcess(proc)
    proc.memory.creepName = creepName
    return proc.pid
  }

  public run() {
    const creep = Game.creeps[this.memory.creepName]
    if (creep === undefined) { return Kernel.killProcess(this.pid) }
    if (creep.spawning) { return }
  }
}
