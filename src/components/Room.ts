import LookTile from './LookTile'
import PheromoneNetwork from './PheromoneNetwork'

// --- Properties ---

Object.defineProperty(Room.prototype, 'lookTiles', {
  configurable: true,
  get(this: Room) {
    if (this._lookTiles === undefined) { this._lookTiles = [] }
    return this._lookTiles
  }
})

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
  switch (Game.time % 6) {
    case 0:
      this.pheromoneNetwork.dissipate()
      break
    case 2:
    case 4:
      this.pheromoneNetwork.diffuse()
      break
    default:
  }
}

Room.prototype.draw = function(this: Room) {
  this.pheromoneNetwork.draw('home', '#47AFFF')
  this.pheromoneNetwork.draw('energy', '#FFE87B')

Room.prototype.getLookTile = function(this: Room, x: number, y: number) {
  if (x < 0 || y < 0 || x > 49 || y > 49) { return }
  let tile = _.find(this.lookTiles, (t) => t.x === x && t.y === y)
  if (tile === undefined) {
    tile = new LookTile(x, y, this.name)
    this.lookTiles.push(tile)
  }
  return tile
}
