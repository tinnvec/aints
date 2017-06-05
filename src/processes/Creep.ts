import { Kernel } from '../components/Kernel'
import { PheromoneNetwork } from '../components/PheromoneNetwork'
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
  private _nearbyController?: Controller | null
  private _nearbyDroppedEnergy?: Resource | null
  private _nearbyLookTiles?: Array<{ dir: number, tile: LookTile }>
  private _nearbySpawn?: Spawn | null
  private _nearbySource?: Source | null

  private creep: Creep

  public run() {
    this.creep = Game.creeps[this.memory.creepName]
    if (this.creep === undefined) { return Kernel.killProcess(this.pid) }
    if (this.creep.spawning) { return }

    if (this.lastMoveWasSuccessful || this.creep.fatigue > 0) { this.stepsFromLastSite++ }

    if (this.lastMoveWasSuccessful) {
      this.stuckCounter = 0
      if (this.isSearching) {
        let dRev = this.lastDirection + 4
        if (dRev > 8) { dRev -= 8 }
        this.homeDirections.push(dRev)
      }
    } else if (this.lastFatigue < 1) {
      if (this.isSearching) {
        this.lastDirection = 0
      } else if (!this.isHarvesting && !this.isUpgrading) {
        this.stuckCounter++
        if (this.stuckCounter > 5) { return this.creep.suicide() }
        this.homeDirections.push(this.lastDirection)
      }
    }

    if (this.nearbyDroppedEnergy !== null && _.sum(this.creep.carry) < this.creep.carryCapacity) {
      this.creep.pickup(this.nearbyDroppedEnergy)
    }

    if (this.nearbySource !== null) {
      this.depositPheromone = 'energy'
      this.isHarvesting = _.sum(this.creep.carry) < this.creep.carryCapacity
      this.isSearching = false
      this.stepsFromLastSite = 0
      if (this.isHarvesting) { this.creep.harvest(this.nearbySource) }
    }

    if (this.nearbySpawn !== null) {
      const creepEnergyAmt = this.creep.carry.energy || 0
      const spawnIsFull = this.nearbySpawn.energy + (creepEnergyAmt) > this.nearbySpawn.energyCapacity
      if (creepEnergyAmt > 0) {
        if (!spawnIsFull) {
          this.creep.transfer(this.nearbySpawn, RESOURCE_ENERGY)
        } else {
          this.searchPheromone = 'controller'
        }
        this.lastDirection = 0
      } else {
        this.searchPheromone = 'energy'
      }

      if (creepEnergyAmt < 1 || spawnIsFull) {
        this.depositPheromone = undefined
        this.isSearching = true
        this.homeDirections = []
        this.stepsFromLastSite = 0
      }
    }

    if (this.nearbyController !== null && this.nearbyController.my) {
      this.depositPheromone = 'controller'
      this.isUpgrading = (this.creep.carry.energy || 0) > 0
      this.isSearching = false
      this.stepsFromLastSite = 0
      if (this.isUpgrading) { this.creep.upgradeController(this.nearbyController) }
    }

    if (this.isSearching && (
      this.stepsFromLastSite >= Config.SEARCH_MAX_STEPS || (
        _.sum(this.creep.carry) >= this.creep.carryCapacity && this.searchPheromone === 'energy'
      )
    )) {
      this.depositPheromone = undefined
      this.isSearching = false
    }

    this.updatePheromoneLevel()
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

  private get isUpgrading(): boolean {
    if (this.memory.isUpgrading === undefined) { this.memory.isUpgrading = false }
    return this.memory.isUpgrading
  }
  private set isUpgrading(value: boolean) { this.memory.isUpgrading = value }

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

  private get nearbyController(): Controller | null {
    if (this._nearbyController === undefined) {
      this._nearbyController = null
      const controllerTile = _.find(this.nearbyLookTiles, ({ tile }) => (tile.structures.controller || []).length > 0)
      if (controllerTile !== undefined) {
        this._nearbyController = _.first(controllerTile.tile.structures.controller) as Controller
      }
    }
    return this._nearbyController
  }

  private get nearbyDroppedEnergy(): Resource | null {
    if (this._nearbyDroppedEnergy === undefined) {
      this._nearbyDroppedEnergy = null
      const droppedEnergyTile = _.find(this.nearbyLookTiles, ({ tile }) => (tile.resources.energy || []).length > 0)
      if (droppedEnergyTile !== undefined) {
        this._nearbyDroppedEnergy = _.first(droppedEnergyTile.tile.resources.energy)
      }
    }
    return this._nearbyDroppedEnergy
  }

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

  private get stuckCounter(): number {
    if (this.memory.stuckCounter === undefined) { this.memory.stuckCounter = 0 }
    return this.memory.stuckCounter
  }
  private set stuckCounter(value: number) { this.memory.stuckCounter = value }

  private getSearchDirection(): number {
    return _(this.nearbyLookTiles)
      .filter(({ dir, tile }) =>
        this.directionPriorities.indexOf(dir) !== -1 && tile.isWalkable(Math.random() < 0.33)
      ).sort((a, b) =>
        this.directionPriorities.indexOf(a.dir) - this.directionPriorities.indexOf(b.dir)
      ).max(({ tile }) =>
        tile.getPheromoneLevels(this.searchPheromone).searchLevel
      ).dir
  }

  private move() {
    this.lastPosition = { x: this.creep.pos.x, y: this.creep.pos.y }
    this.lastFatigue = this.creep.fatigue
    if (this.creep.fatigue > 0 || this.isHarvesting || this.isUpgrading) { return }
    const dir = this.isSearching ? this.getSearchDirection() : this.homeDirections.pop()
    if (dir === undefined) { return }
    this.lastDirection = dir
    // exit pheromones check
    const lookTile = _.find(this.nearbyLookTiles, (lt) => lt.dir === dir)
    if (lookTile !== undefined) {
      const { tile } = lookTile
      if (this.depositPheromone !== undefined && (tile.x === 0 || tile.y === 0 || tile.x === 49 || tile.y === 49)) {
        const currentLevel = PheromoneNetwork.getTypeLevelAt(this.depositPheromone, tile.x, tile.y, tile.roomName)
        const newAmount = Config.PHEROMONE_MAX_TILE_AMOUNT - (this.stepsFromLastSite * 2)
        if (newAmount > currentLevel) {
          PheromoneNetwork.setTypeLevelAt(this.depositPheromone, newAmount, tile.x, tile.y, tile.roomName)
        }
      }
    }
    this.creep.move(dir)
  }

  private updatePheromoneLevel() {
    if (this.depositPheromone === undefined) { return }
    if (!this.lastMoveWasSuccessful) { return }
    const { x, y, roomName } = this.creep.pos
    const currentLevel = PheromoneNetwork.getTypeLevelAt(this.depositPheromone, x, y, roomName)
    const newAmount = Config.PHEROMONE_MAX_TILE_AMOUNT - (this.stepsFromLastSite * 2)
    if (newAmount < currentLevel) { return }
    PheromoneNetwork.setTypeLevelAt(this.depositPheromone, newAmount, x, y, roomName)
  }
}
