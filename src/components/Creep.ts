import * as Config from '../config/config'

// --- Properties ---

Object.defineProperty(Creep.prototype, 'isCarryingEnergy', {
  configurable: true,
  get(this: Creep) {
    if (this._isCaryingEnergy === undefined) {
      this._isCaryingEnergy = (this.carry.energy || 0) > 0
    }
    return this._isCaryingEnergy
  }
})

Object.defineProperty(Creep.prototype, 'currentDepositPheromone', {
  configurable: true,
  get(this: Creep) {
    if (this._currentDepositPheromone === undefined) {
      this._currentDepositPheromone = this.isSearching ? 'home' : this.isCarryingEnergy ? 'energy' : undefined
    }
    return this._currentDepositPheromone
  }
})

Object.defineProperty(Creep.prototype, 'currentSearchPheromone', {
  configurable: true,
  get(this: Creep) {
    if (this._currentSearchPheromone === undefined) {
      this._currentSearchPheromone = this.isSearching ? 'energy' : 'home'
    }
    return this._currentSearchPheromone
  }
})

Object.defineProperty(Creep.prototype, 'directionPriorities', {
  configurable: true,
  get(this: Creep) {
    if (this._directionPriorities === undefined) {
      switch (this.lastDirection) {
        case TOP:
          this._directionPriorities = (_.shuffle([TOP, TOP_LEFT, TOP_RIGHT]) as number[])
            .concat(_.shuffle([LEFT, RIGHT]), _.shuffle([BOTTOM_LEFT, BOTTOM_RIGHT]))
          break
        case TOP_LEFT:
          this._directionPriorities = (_.shuffle([TOP_LEFT, LEFT, TOP]) as number[])
            .concat(_.shuffle([BOTTOM_LEFT, TOP_RIGHT]), _.shuffle([BOTTOM, RIGHT]))
          break
        case LEFT:
          this._directionPriorities = (_.shuffle([LEFT, BOTTOM_LEFT, TOP_LEFT]) as number[])
            .concat(_.shuffle([BOTTOM, TOP]), _.shuffle([BOTTOM_RIGHT, TOP_RIGHT]))
          break
        case BOTTOM_LEFT:
          this._directionPriorities = (_.shuffle([BOTTOM_LEFT, BOTTOM, LEFT]) as number[])
            .concat(_.shuffle([BOTTOM_RIGHT, TOP_LEFT]), _.shuffle([RIGHT, TOP]))
          break
        case BOTTOM:
          this._directionPriorities = (_.shuffle([BOTTOM, BOTTOM_RIGHT, BOTTOM_LEFT]) as number[])
            .concat(_.shuffle([RIGHT, LEFT]), _.shuffle([TOP_RIGHT, TOP_LEFT]))
          break
        case BOTTOM_RIGHT:
          this._directionPriorities = (_.shuffle([BOTTOM_RIGHT, RIGHT, BOTTOM]) as number[])
            .concat(_.shuffle([TOP_RIGHT, BOTTOM_LEFT]), _.shuffle([TOP, LEFT]))
          break
        case RIGHT:
          this._directionPriorities = (_.shuffle([RIGHT, TOP_RIGHT, BOTTOM_RIGHT]) as number[])
            .concat(_.shuffle([TOP, BOTTOM]), _.shuffle([TOP_LEFT, BOTTOM_LEFT]))
          break
        case TOP_RIGHT:
          this._directionPriorities = (_.shuffle([TOP_RIGHT, TOP, RIGHT]) as number[])
            .concat(_.shuffle([TOP_LEFT, BOTTOM_RIGHT]), _.shuffle([LEFT, BOTTOM]))
          break
        default:
          this._directionPriorities =
            _.shuffle([TOP, TOP_LEFT, TOP_RIGHT, LEFT, RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT, BOTTOM])
      }
      if (this.lastDirection !== undefined && this._directionPriorities.length < 8 && this.isCarryingEnergy) {
        this._directionPriorities.push(this.lastDirection)
      }
    }
    return this._directionPriorities
  }
})

Object.defineProperty(Creep.prototype, 'isHarvesting', {
  configurable: true,
  get(this: Creep) {
    if (this._isHarvesting === undefined) {
      this._isHarvesting =
        this.nearbySource !== undefined && this.nearbySource.energy > 0 && _.sum(this.carry) < this.carryCapacity
    }
    return this._isHarvesting
  }
})

Object.defineProperty(Creep.prototype, 'nearbySource', {
  configurable: true,
  get(this: Creep) {
    if (this._nearbySource === undefined) {
      const sourceTile = _.find(
        this.nearbyTiles,
        ({ tile }) => (tile.sources || []).length > 0 && _.every(tile.sources, (source) => source.energy > 0)
      )
      if (sourceTile !== undefined) { this._nearbySource = _.first(sourceTile.tile.sources) }
    }
    return this._nearbySource
  }
})

Object.defineProperty(Creep.prototype, 'nearbySpawn', {
  configurable: true,
  get(this: Creep) {
    if (this._nearbySpawn === undefined) {
      const spawnTile = _.find(this.nearbyTiles, ({ tile }) => (tile.structures.spawn || []).length > 0)
      if (spawnTile !== undefined) { this._nearbySpawn = _.first(spawnTile.tile.structures.spawn) as Spawn }
    }
    return this._nearbySpawn
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
        const tile = this.room.getLookTile(nx, ny)
        if (tile === undefined) { return }
        this._nearbyTiles.push({ dir: parseInt(dir, 10), tile })
      }
    }
    return this._nearbyTiles
  }
})

Object.defineProperty(Creep.prototype, 'isSearching', {
  configurable: true,
  get(this: Creep) {
    if (this._isSearching === undefined) {
      if (this.memory.isSearching !== undefined) {
        this._isSearching = this.memory.isSearching
      } else {
        this._isSearching = true
      }
    }
    return this._isSearching
  },
  set(this: Creep, value: boolean) {
    this.stepsFromLastSite = 0
    this.lastDirection = undefined
    this.memory.isSearching = value
    this._isSearching = value
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

  // Check for spawn near and no energy to reset search
  if (this.nearbySpawn !== undefined && !this.isCarryingEnergy) { this.isSearching = true }
  // Check harvesting and carrying energy to suppress search
  if (this.isHarvesting && this.isCarryingEnergy) { this.isSearching = false }
  // Check fatigue
  if (this.fatigue > 0 && this.lastMoveWasSuccessful) { this.stepsFromLastSite++ }

  // Deposit pheromone
  if (this.lastMoveWasSuccessful) { this.depositPheromone() }

  // Check for spawn to transfer to
  if (this.nearbySpawn !== undefined) { this.transfer(this.nearbySpawn, RESOURCE_ENERGY) }
  // Check for harvesting
  if (this.isHarvesting) { this.harvest(this.nearbySource!) }
  // Check for max search length
  if (this.isSearching && this.stepsFromLastSite >= Config.MAX_SEARCH_STEPS) { this.isSearching = false }

  // Move
  if (!this.isHarvesting) { this.lastMoveWasSuccessful = this.searchMove() }
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

Creep.prototype.getSearchPheromoneDirection = function(this: Creep): number {
  return _(this.nearbyTiles)
    .filter(({ dir, tile }) =>
      this.directionPriorities.indexOf(dir) !== -1 &&
      tile.isWalkable(this.isCarryingEnergy ? true : Math.random() < 0.25)
    )
    .sort((a, b) => this.directionPriorities.indexOf(a.dir) - this.directionPriorities.indexOf(b.dir))
    .map(({ dir, tile }) => {
      const depositPheromoneLevel = this.currentDepositPheromone !== undefined ?
        tile.pheromones[this.currentDepositPheromone] : 0
      const searchPheromoneLevel = tile.pheromones[this.currentSearchPheromone]
      return { dir, level: (2 * searchPheromoneLevel) - depositPheromoneLevel }
    }).max(({ level }) => level).dir
}

Creep.prototype.searchMove = function(this: Creep): boolean {
  if (this.fatigue > 0 && this.lastMoveWasSuccessful) { return true }
  const dir = this.getSearchPheromoneDirection()
  if (this.move(dir) === OK) {
    this.lastDirection = dir
    this.stepsFromLastSite++
    return true
  }
  this.lastDirection = undefined
  return false
}
