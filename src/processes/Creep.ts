import { Kernel } from '../components/Kernel'
import { Process } from '../components/Process'
import { registerProcess } from '../decorators/registerProcess'

const DIRECTION_COORDINATE_DELTAS: { [dir: number]: [number, number] } = {
  8: [-1, -1],  1: [0, -1],  2: [1, -1],
  7: [-1, 0],   /*Center*/   3: [1, 0],
  6: [-1, 1],   5: [0, 1],   4: [1, 1]
}

@registerProcess
export class CreepProcess extends Process {
  public static start(creepName: string) {
    const proc = new CreepProcess(0)
    Kernel.addProcess(proc)
    proc.memory.creepName = creepName
    proc.memory.lastDirection = 0
    proc.memory.isSearching = true
    proc.memory.searchPheromone = 'energy'
    return proc.pid
  }

  private creep: Creep
  private directionPriorities: number[]
  private nearbyLookTiles: Array<{ dir: number, tile: LookTile }>

  public run() {
    this.creep = Game.creeps[this.memory.creepName]
    if (this.creep === undefined) { return Kernel.killProcess(this.pid) }
    if (this.creep.spawning) { return }

    this.directionPriorities = this.getDirectionPriorities(this.memory.lastDirection)
    this.nearbyLookTiles = this.getNearbyLookTiles()

  private getDirectionPriorities(lastDirection: number): number[] {
    // Directions
    // 8 1 2
    // 7 * 3
    // 6 5 4
    if (lastDirection === 0) { return _.shuffle([1, 2, 3, 4, 5, 6, 7, 8]) }
    const result: number[] = [lastDirection]
    let i: number
    let dl: number
    let dr: number
    for (i = 1; i < 4; i++) {
      dl = lastDirection - i
      if (dl < 1) { dl += 8 }
      dr = lastDirection + i
      if (dr > 8) { dr -= 8 }
      result.push(..._.shuffle([dl, dr]))
    }
    let dRev = lastDirection + 4
    if (dRev > 8) { dRev -= 8 }
    result.push(dRev)
    return result
  }

  private getNearbyLookTiles(): Array<{ dir: number, tile: LookTile }> {
    const {x, y} = this.creep.pos
    const result: Array<{ dir: number, tile: LookTile }> = []
    for (const dir in DIRECTION_COORDINATE_DELTAS) {
      const [dx, dy] = DIRECTION_COORDINATE_DELTAS[dir]
      const nx = x + dx
      const ny = y + dy
      const tile = this.creep.room.getLookTile(nx, ny)
      if (tile === undefined) { continue }
      result.push({ dir: parseInt(dir, 10), tile })
    }
    return result
  }

  private getSearchDirection(): number {
    return _(this.nearbyLookTiles)
      .filter(({ dir, tile }) =>
        this.directionPriorities.indexOf(dir) !== -1 && tile.isWalkable(!this.memory.isSearching)
      ).sort((a, b) =>
        this.directionPriorities.indexOf(a.dir) - this.directionPriorities.indexOf(b.dir)
      ).max(({ tile }) => {
        const { searchLevel, otherLevel } = tile.getPheromoneLevels(this.memory.searchPheromone)
        return (searchLevel * 2) - otherLevel
      }).dir
  }
}
