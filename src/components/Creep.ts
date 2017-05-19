import * as Config from '../config/config'
import LookTile from './LookTile'

// --- Properties ---

Object.defineProperty(Creep.prototype, 'isCarryingEnergy', {
  configurable: true,
  get(this: Creep) { return (this.carry.energy || 0) > 0 }
})

Object.defineProperty(Creep.prototype, 'currentDepositPheromone', {
  configurable: true,
  get(this: Creep) {
    return this.isSearching ? 'home' : this.isCarryingEnergy ? 'energy' : undefined
  }
})

Object.defineProperty(Creep.prototype, 'currentSearchPheromone', {
  configurable: true,
  get(this: Creep) {
    return this.isSearching ? 'energy' : 'home'
  }
})

Object.defineProperty(Creep.prototype, 'isHarvesting', {
  configurable: true,
  get(this: Creep) {
    return this.nearbySource !== undefined && this.nearbySource.energy > 0 && _.sum(this.carry) < this.carryCapacity
  }
})

Object.defineProperty(Creep.prototype, 'isSearching', {
  configurable: true,
  get(this: Creep) {
    if (this.memory.isSearching === undefined) { this.memory.isSearching = true }
    return this.memory.isSearching
  },
  set(this: Creep, value: boolean) {
    this.stepsFromLastSite = 0
    this.lastDirection = undefined
    this.memory.isSearching = value
  }
})

Object.defineProperty(Creep.prototype, 'lastMoveWasSuccessful', {
  configurable: true,
  get(this: Creep) {
    if (this.memory.lastMoveWasSuccessful === undefined) { this.memory.lastMoveWasSuccessful = true }
    return this.memory.lastMoveWasSuccessful
  },
  set(this: Creep, value: boolean) {
    this.memory.lastMoveWasSuccessful = value
  }
})

Object.defineProperty(Creep.prototype, 'lastDirection', {
  configurable: true,
  get(this: Creep) {
    if (this.memory.lastDirection === undefined) { return undefined }
    return this.memory.lastDirection
  },
  set(this: Creep, value: number | undefined) {
    this.memory.lastDirection = value
  }
})

Object.defineProperty(Creep.prototype, 'lastPheromoneDepositAmount', {
  configurable: true,
  get(this: Creep) {
    return this.memory.lastPheromoneDepositAmount
  },
  set(this: Creep, value: number) {
    this.memory.lastPheromoneDepositAmount = value
  }
})

Object.defineProperty(Creep.prototype, 'nearbySource', {
  configurable: true,
  get(this: Creep) {
    const sourceTile = _.find(
      this.nearbyTiles,
      ({ tile }) => (tile.sources || []).length > 0 && _.every(tile.sources, (source) => source.energy > 0)
    )
    if (sourceTile !== undefined) { return _.first(sourceTile.tile.sources) }
  }
})

Object.defineProperty(Creep.prototype, 'nearbySpawn', {
  configurable: true,
  get(this: Creep) {
    const spawnTile = _.find(this.nearbyTiles, ({ tile }) => (tile.structures.spawn || []).length > 0)
    if (spawnTile !== undefined) { return _.first(spawnTile.tile.structures.spawn) as Spawn }
  }
})

Object.defineProperty(Creep.prototype, 'nearbyTiles', {
  configurable: true,
  get(this: Creep) {
    if (this._nearbyTiles === undefined) {
      this._nearbyTiles = []
      const DIRECTION_COORDINATE_DELTAS: { [dir: number]: [number, number] } = {
        8: [-1, -1],  1: [0, -1],  2: [1, -1],
        7: [-1, 0],   /*Center*/   3: [1, 0],
        6: [-1, 1],   5: [0, 1],   4: [1, 1]
      }
      const {x, y} = this.pos
      for (const dir in DIRECTION_COORDINATE_DELTAS) {
        const [dx, dy] = DIRECTION_COORDINATE_DELTAS[dir]
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx > 49 || ny > 49) { continue }
        this._nearbyTiles.push({ dir: parseInt(dir, 10), tile: new LookTile(nx, ny, this.room.name) })
      }
    }
    return this._nearbyTiles
  }
})

Object.defineProperty(Creep.prototype, 'stepsFromLastSite', {
  configurable: true,
  get(this: Creep) {
    if (this.memory.stepsFromLastSite === undefined) { this.memory.stepsFromLastSite = 0 }
    return this.memory.stepsFromLastSite
  },
  set(this: Creep, value: number) {
    this.memory.stepsFromLastSite = value
  }
})

// --- Methods ---

Creep.prototype.run = function(this: Creep) {
  if (this.spawning) { return }

  if (this.isSearching) {
    const nearbySources = this.pos.findInRange<Source>(FIND_SOURCES_ACTIVE, 1)
    if (nearbySources.length > 0) {
      this.currentSourceId = _.first(nearbySources).id
      this.isSearching = false
    }
    if (this.stepsFromLastSite >= MAX_SEARCH_STEPS - 1) { this.isSearching = false }
    if (this.pos.isNearTo(this.homePosition)) { this.stepsFromLastSite = 0 }
  }

  if (!this.isSearching) {
    if (this.currentSourceId !== undefined) {
      const source = Game.getObjectById<Source>(this.currentSourceId)
      if (source !== null) { this.harvest(source) }
      if (_.sum(this.carry) >= this.carryCapacity) { this.currentSourceId = undefined }
    }

    if (this.currentSourceId === undefined) {
      if (this.pos.isNearTo(this.homePosition)) {
        this.homePosition.lookFor<Structure>(LOOK_STRUCTURES).forEach((struct) => {
          if (!this.isCarryingEnergy) { return }
          if (struct.structureType === STRUCTURE_SPAWN) { this.transfer(struct, RESOURCE_ENERGY) }
        })
        if (!this.isCarryingEnergy) { this.isSearching = true }
      }
    }
  }

  if (this.currentSourceId === undefined) {
    this.lastMoveWasSuccessful = this.fatigue < 1 ? this.searchMove() : false
  }

  if (this.lastMoveWasSuccessful) {
    this.lastPheromoneDepositAmount = this.depositPheromone()
  } else {
    this.lastPheromoneDepositAmount = 0
  }
}

}

Creep.prototype.depositPheromone = function(this: Creep): number {
  if (this.currentDepositPheromone === undefined) { return 0 }
  const currentDepositLevel = this.room.pheromoneNetwork.getLevel(this.currentDepositPheromone, this.pos.x, this.pos.y)
  const maxDepositAmount = Config.MAX_TILE_PHEROMONE_LEVEL - (this.stepsFromLastSite * Config.PHEROMONE_DEPOSIT_RATE)
  const depositAmount = Math.max(0, maxDepositAmount - currentDepositLevel)
  if (depositAmount <= 0) { return 0 }
  this.room.pheromoneNetwork.increaseLevel(this.currentDepositPheromone, this.pos.x, this.pos.y, depositAmount)
  return depositAmount
}

Creep.prototype.getDirectionPriorities = function(this: Creep): number[] {
  switch (this.lastDirection) {
    case TOP:
      return (_.shuffle([TOP, TOP_LEFT, TOP_RIGHT]) as number[])
        .concat(_.shuffle([LEFT, RIGHT]), _.shuffle([BOTTOM_LEFT, BOTTOM_RIGHT]))
    case TOP_LEFT:
      return (_.shuffle([TOP_LEFT, LEFT, TOP]) as number[])
        .concat(_.shuffle([BOTTOM_LEFT, TOP_RIGHT]), _.shuffle([BOTTOM, RIGHT]))
    case LEFT:
      return (_.shuffle([LEFT, BOTTOM_LEFT, TOP_LEFT]) as number[])
        .concat(_.shuffle([BOTTOM, TOP]), _.shuffle([BOTTOM_RIGHT, TOP_RIGHT]))
    case BOTTOM_LEFT:
      return (_.shuffle([BOTTOM_LEFT, BOTTOM, LEFT]) as number[])
        .concat(_.shuffle([BOTTOM_RIGHT, TOP_LEFT]), _.shuffle([RIGHT, TOP]))
    case BOTTOM:
      return (_.shuffle([BOTTOM, BOTTOM_RIGHT, BOTTOM_LEFT]) as number[])
        .concat(_.shuffle([RIGHT, LEFT]), _.shuffle([TOP_RIGHT, TOP_LEFT]))
    case BOTTOM_RIGHT:
      return (_.shuffle([BOTTOM_RIGHT, RIGHT, BOTTOM]) as number[])
        .concat(_.shuffle([TOP_RIGHT, BOTTOM_LEFT]), _.shuffle([TOP, LEFT]))
    case RIGHT:
      return (_.shuffle([RIGHT, TOP_RIGHT, BOTTOM_RIGHT]) as number[])
        .concat(_.shuffle([TOP, BOTTOM]), _.shuffle([TOP_LEFT, BOTTOM_LEFT]))
    case TOP_RIGHT:
      return (_.shuffle([TOP_RIGHT, TOP, RIGHT]) as number[])
        .concat(_.shuffle([TOP_LEFT, BOTTOM_RIGHT]), _.shuffle([LEFT, BOTTOM]))
    default:
      return _.shuffle([TOP, TOP_LEFT, TOP_RIGHT, LEFT, RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT, BOTTOM])
  }
}

Creep.prototype.getSearchPheromoneDirection = function(this: Creep): number {
  return _(this.directionPheromoneLevels).map(
    ({ dir, depositPheromoneLevel, searchPheromoneLevel }) =>
      ({ dir, level: (2 * searchPheromoneLevel) - depositPheromoneLevel })
  ).shuffle().max((r) => r.level).dir
}

Creep.prototype.searchMove = function(this: Creep): boolean {
  const moveSuccess = this.move(this.getSearchPheromoneDirection()) === OK
  if (moveSuccess) { this.stepsFromLastSite++ }
  return moveSuccess
}
