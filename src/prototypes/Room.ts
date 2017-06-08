import { LookTile } from '../components/LookTile'

// --- Properties ---

Object.defineProperty(Room.prototype, 'lookTiles', {
  configurable: true,
  get(this: Room) {
    if (this._lookTiles === undefined) { this._lookTiles = [] }
    return this._lookTiles
  }
})

// --- Methods ---

// Room.prototype.draw = function(this: Room) {
//   this.pheromoneNetwork.draw('home', '#386CA7')
//   this.pheromoneNetwork.draw('controller', '#F4331F')
//   this.pheromoneNetwork.draw('energy', '#FFE87B')
// }

Room.prototype.getLookTile = function(this: Room, x: number, y: number) {
  if (x < 0 || y < 0 || x > 49 || y > 49) { return }
  let tile = _.find(this.lookTiles, (t) => t.x === x && t.y === y)
  if (tile === undefined) {
    tile = new LookTile(x, y, this.name)
    this.lookTiles.push(tile)
  }
  return tile
}
