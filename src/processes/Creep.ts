import { Kernel } from '../components/Kernel'
import { Process } from '../components/Process'
import * as Config from '../config/config'
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
    Kernel.storeProcessTable()
    return proc.pid
  }

  private _directionPriorities?: number[]
  private _lastMoveWasSuccessful?: boolean
  private _nearbyLookTiles?: Array<{ dir: number, tile: LookTile }>
  private _nearbySpawn?: Spawn | null
  private _nearbySource?: Source | null

  private creep: Creep

  public run() {
    this.creep = Game.creeps[this.memory.creepName]
    if (this.creep === undefined) { return Kernel.killProcess(this.pid) }
    if (this.creep.spawning) { return }


    if (this.nearbySpawn !== undefined) {
      this.memory.isSearching = true
      this.memory.homeDirections = []
      this.memory.stepsFromLastSite = 0
    }

    if (this.memory.isSearching && this.memory.stepsFromLastSite >= Config.SEARCH_MAX_STEPS) {
      this.memory.isSearching = false
    }

    this.move()
  }

  private get depositPheromone(): string | undefined {
    return this.memory.depositPheromone
  }
  private set depositPheromone(value: string | undefined) { this.memory.depositPheromone = value }

  private get directionPriorities(): number[] {
    // Directions
    // 8 1 2
    // 7 * 3
    // 6 5 4
    if (this._directionPriorities === undefined) {
      this._directionPriorities = []
      if (this.lastDirection === 0) {
        this._directionPriorities = _.shuffle([1, 2, 3, 4, 5, 6, 7, 8])
      } else {
        let i: number
        let dl: number
        let dr: number
        for (i = 1; i < 4; i++) {
          dl = this.lastDirection - i
          if (dl < 1) { dl += 8 }
          dr = this.lastDirection + i
          if (dr > 8) { dr -= 8 }
          const dirs = [dl, dr]
          if (i === 1) { dirs.push(this.lastDirection) }
          this._directionPriorities.push(..._.shuffle(dirs))
        }
        // let dRev = this.lastDirection + 4
        // if (dRev > 8) { dRev -= 8 }
        // this._directionPriorities.push(dRev)
      }
    }
    return this._directionPriorities
  }

  private get homeDirections(): number[] {
    if (this.memory.homeDirections === undefined) { this.memory.homeDirections = [] }
    return this.memory.homeDirections
  }
  private set homeDirections(value: number[]) { this.memory.homeDirections = value }

  private get isHarvesting(): boolean {
    if (this.memory.isHarvesting === undefined) { this.memory.isHarvesting = false }
    return this.memory.isHarvesting
  }
  private set isHarvesting(value: boolean) { this.memory.isHarvesting = value }

  private get isSearching(): boolean {
    if (this.memory.isSearching === undefined) { this.memory.isSearching = true }
    return this.memory.isSearching
  }
  private set isSearching(value: boolean) { this.memory.isSearching = value }

  private get lastDirection(): number {
    if (this.memory.lastDirection === undefined) { this.memory.lastDirection = 0 }
    return this.memory.lastDirection
  }
  private set lastDirection(value: number) { this.memory.lastDirection = value }

  private get lastFatigue(): number {
    if (this.memory.lastFatigue === undefined) { this.memory.lastFatigue = 0 }
    return this.memory.lastFatigue
  }
  private set lastFatigue(value: number) { this.memory.lastFatigue = value }

  private get lastPosition(): { x: number, y: number} {
    if (this.memory.lastPosition === undefined) { this.memory.lastPosition = { x: 0, y: 0 } }
    return this.memory.lastPosition
  }
  private set lastPosition(value: { x: number, y: number}) { this.memory.lastPosition = value }

  private get lastMoveWasSuccessful(): boolean {
    if (this._lastMoveWasSuccessful === undefined) {
      this._lastMoveWasSuccessful = this.lastFatigue < 1 &&
        (this.creep.pos.x !== this.lastPosition.x || this.creep.pos.y !== this.lastPosition.y)
    }
    return this._lastMoveWasSuccessful
  }

  private get searchPheromone(): string {
    if (this.memory.searchPheromone === undefined) { this.memory.searchPheromone = 'energy' }
    return this.memory.searchPheromone
  }
  private set searchPheromone(value: string) { this.memory.searchPheromone = value }

  private get stepsFromLastSite(): number {
    if (this.memory.stepsFromLastSite === undefined) { this.memory.stepsFromLastSite = 0 }
    return this.memory.stepsFromLastSite
  }
  private set stepsFromLastSite(value: number) { this.memory.stepsFromLastSite = value }

  private get nearbyLookTiles(): Array<{ dir: number, tile: LookTile }> {
    if (this._nearbyLookTiles === undefined) {
      const { x, y } = this.creep.pos
      this._nearbyLookTiles = []
      for (const dir in DIRECTION_COORDINATE_DELTAS) {
        const [dx, dy] = DIRECTION_COORDINATE_DELTAS[dir]
        const nx = x + dx
        const ny = y + dy
        const tile = this.creep.room.getLookTile(nx, ny)
        if (tile === undefined) { continue }
        this._nearbyLookTiles.push({ dir: parseInt(dir, 10), tile })
      }
    }
    return this._nearbyLookTiles
  }

  private get nearbySpawn(): Spawn | null {
    if (this._nearbySpawn === undefined) {
      this._nearbySpawn = null
      const spawnTile = _.find(this.nearbyLookTiles, ({ tile }) => (tile.structures.spawn || []).length > 0)
      if (spawnTile !== undefined) { this._nearbySpawn = _.first(spawnTile.tile.structures.spawn) as Spawn }
    }
    return this._nearbySpawn
  }

  private get nearbySource(): Source | null {
    if (this._nearbySource === undefined) {
      this._nearbySource = null
      const sourceTile = _.find(
        this.nearbyLookTiles,
        ({ tile }) => (tile.sources || []).length > 0 && _.every(tile.sources, (s) => s.energy > 0)
      )
      if (sourceTile !== undefined) { this._nearbySource = _.first(sourceTile.tile.sources) }
    }
    return this._nearbySource
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

  private move() {
    if (this.creep.fatigue > 0) {
      this.memory.stepsFromLastSite++
      return
    }

    if (this.memory.isSearching) {
      const mdir = this.getSearchDirection()
      if (this.creep.move(mdir) === OK) {
        let dRev = mdir + 4
        if (dRev > 8) { dRev -= 8 }

        this.memory.homeDirections.push(dRev)
        this.memory.lastDirection = mdir
        this.memory.stepsFromLastSite++
      } else {
        this.memory.lastDirection = 0
      }
    } else {
      const hdir = this.memory.homeDirections.pop()
      this.creep.move(hdir)
    }
  }
}
