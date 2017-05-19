import LookTile from './LookTile'


const MAX_TILE_PHEROMONE_LEVEL: number = 255
const MAX_SEARCH_STEPS: number = 50
const PHEROMONE_DEPOSIT_RATE: number = Math.floor(MAX_TILE_PHEROMONE_LEVEL / MAX_SEARCH_STEPS)

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

Object.defineProperty(Creep.prototype, 'currentSourceId', {
  configurable: true,
  get(this: Creep) {
    return this.memory.currentSourceId
  },
  set(this: Creep, value: string | undefined) {
    this.memory.currentSourceId = value
  }
})

Object.defineProperty(Creep.prototype, 'homePosition', {
  configurable: true,
  get(this: Creep) {
    return _.create(RoomPosition.prototype, this.memory.homePosition)
  }
})

Object.defineProperty(Creep.prototype, 'isSearching', {
  configurable: true,
  get(this: Creep) {
    if (this.memory.isSearching === undefined) { this.memory.isSearching = false }
    return this.memory.isSearching
  },
  set(this: Creep, value: boolean) {
    this.stepsFromLastSite = 0
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

Object.defineProperty(Creep.prototype, 'lastPheromoneDepositAmount', {
  configurable: true,
  get(this: Creep) {
    return this.memory.lastPheromoneDepositAmount
  },
  set(this: Creep, value: number) {
    this.memory.lastPheromoneDepositAmount = value
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

Creep.prototype.getCurrentLocationPheromoneLevel = function(this: Creep, type: string): number {
  return this.getLocationPheromoneLevel(type, this.pos.x, this.pos.y)
}

Creep.prototype.depositPheromone = function(this: Creep): number {
  if (this.currentDepositPheromone === undefined) { return 0 }
  const currentDepositLevel = this.getCurrentLocationPheromoneLevel(this.currentDepositPheromone)
  const maxDepositAmount = (MAX_SEARCH_STEPS - this.stepsFromLastSite) * PHEROMONE_DEPOSIT_RATE
  const depositAmount = Math.max(0, maxDepositAmount - currentDepositLevel)
  if (depositAmount <= 0) { return 0 }
  this.room.pheromoneNetwork.increaseLevel(this.currentDepositPheromone, this.pos.x, this.pos.y, depositAmount)
  return depositAmount
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
