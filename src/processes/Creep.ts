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

  private getDirectionPriorities(lastDirection: number): number[] {
    // 8 1 2
    // 7 * 3
    // 6 5 4
    if (lastDirection === 0) {
      return _.shuffle([1, 2, 3, 4, 5, 6, 7, 8])
    }
    const result: number[] = []
    result.push(lastDirection)
    for (let i = 1; i < 4; i++) {
      let dl = lastDirection - i
      if (dl < 1) { dl = dl + 8 }
      let dr = lastDirection + i
      if (dr > 8) { dr = dr - 8 }
      result.push(..._.shuffle([dl, dr]))
    }
    let dRev = lastDirection + 4
    if (dRev > 8) { dRev = dRev - 8 }
    result.push(dRev)
    return result
  }
}
