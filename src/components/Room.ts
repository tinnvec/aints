import PheromoneNetwork from './PheromoneNetwork'

// --- Properties ---

Object.defineProperty(Room.prototype, 'pheromoneNetwork', {
  configurable: true,
  get(this: Room) {
    if (this._pheromoneNetwork === undefined && this.memory.pheromoneNetwork !== undefined) {
      this._pheromoneNetwork = PheromoneNetwork.deserialize(this.memory.pheromoneNetwork)
    }
    if (this._pheromoneNetwork === undefined) {
      this._pheromoneNetwork = new PheromoneNetwork(this)
    }
    if (this.memory.pheromoneNetwork === undefined) {
      this.memory.pheromoneNetwork = this._pheromoneNetwork.serialize()
    }
    return this._pheromoneNetwork
  }
})

// --- Methods ---

Room.prototype.run = function(this: Room) {
  this.pheromoneNetwork.dissipate()
}

Room.prototype.draw = function(this: Room) {
  this.pheromoneNetwork.draw('home', '#47AFFF')
  this.pheromoneNetwork.draw('energy', '#FFE87B')
}

Room.prototype.getWalkableTerrainAt = function(
  this: Room,
  x: number,
  y: number,
  ignoreCreeps: boolean = false
): boolean {
  if (x < 0 || y < 0 || x > 49 || y > 49) { return false }
  for (const lookResult of this.lookAt(x, y)) {
    if (lookResult.creep !== undefined) { if (!ignoreCreeps) { return false } }
    if (lookResult.constructionSite !== undefined) {
      if (_.includes(OBSTACLE_OBJECT_TYPES, lookResult.constructionSite.structureType)) { return false }
    }
    if (lookResult.structure !== undefined) {
      if (_.includes(OBSTACLE_OBJECT_TYPES, lookResult.structure.structureType)) { return false }
    }
    if (lookResult.terrain !== undefined) {
      if (lookResult.terrain === 'wall') { return false }
    }
  }
  return true
}
