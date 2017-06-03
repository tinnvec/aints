import * as Config from '../config/config'
import Profile from '../lib/screeps-profiler/Profile'

// interface PheromoneNetwork {
//   readonly layers: { [type: string]: CostMatrix }
//   decay(): void
//   diffuse(): void
//   draw(type: string, color?: string): void
//   getTileLevel(type: string, x: number, y: number): number
//   setTileLevel(type: string, x: number, y: number, amount: number): void
//   serialize(): { layers: { [type: string]: number[] }, roomName: string }
// }

@Profile
export default class PheromoneNetwork {
  public static deserialize(memObj: { layers: { [type: string]: number[] }, roomName: string }): PheromoneNetwork {
    const pn = new PheromoneNetwork(Game.rooms[memObj.roomName])
    for (const type in memObj.layers) { pn.layers[type] = PathFinder.CostMatrix.deserialize(memObj.layers[type]) }
    return pn
  }

  public readonly layers: { [type: string]: CostMatrix }

  private room: Room

  constructor(room: Room) {
    this.room = room
    this.layers = {
      controller: new PathFinder.CostMatrix(),
      energy: new PathFinder.CostMatrix(),
      home: new PathFinder.CostMatrix()
    }
  }

  public decay() {
    const rate = 1
    let x: number
    let y: number
    for (const type in this.layers) {
      for (x = 0; x < 50; x++) {
        for (y = 0; y < 50; y++) {
          const curr = this.layers[type].get(x, y)
          if (curr === 0) { continue }
          this.layers[type].set(x, y, curr - rate)
        }
      }
    }
  }

  public diffuse() {
    const rate = 0.01
    const min = 4
    let x: number
    let y: number
    for (const type in this.layers) {
      for (x = 0; x < 50; x++) {
        for (y = 0; y < 50; y++) {
          const curr = this.layers[type].get(x, y)
          if (curr < min) { continue }
          const amt = Math.max(Math.floor(curr * rate), 1)
          const DIRECTION_COORDINATE_DELTAS: { [dir: number]: [number, number] } = {
            8: [-1, -1],  1: [0, -1],  2: [1, -1],
            7: [-1, 0],   /*Center*/   3: [1, 0],
            6: [-1, 1],   5: [0, 1],   4: [1, 1]
          }
          const nearbyTiles: Array<{ amount: number, x: number, y: number}> = []
          for (const dir in DIRECTION_COORDINATE_DELTAS) {
            const [dx, dy] = DIRECTION_COORDINATE_DELTAS[dir]
            const nx = x + dx
            const ny = y + dy
            if (nx < 0 || ny < 0 || nx > 49 || ny > 49) { continue }
            const nearbyCurr = this.layers[type].get(nx, ny)
            if (nearbyCurr >= curr) { continue }
            nearbyTiles.push({ amount: nearbyCurr, x: nx, y: ny })
          }
          if (nearbyTiles.length < 1) { continue }
          const lowestNearby = _(nearbyTiles).shuffle().min(({ amount }) => amount)
          this.layers[type].set(lowestNearby.x, lowestNearby.y, Math.min(lowestNearby.amount + amt, 255))
          this.layers[type].set(x, y, Math.max(curr - amt, 0))
        }
      }
    }
  }

  public draw(layer: string, color: string = '#CCCCCC') {
    const vis = new RoomVisual(this.room.name)
    let x: number
    let y: number
    for (y = 0; y < 50; ++y) {
      for (x = 0; x < 50; ++x) {
        const str = this.getTileLevel(layer, x, y)
        if (str > 0) {
          vis.circle(x, y, {
            fill: color,
            opacity: 1 / ((Object.keys(this.layers).length) * 2),
            radius: str / (Config.PHEROMONE_MAX_TILE_AMOUNT * 2),
            stroke: color,
            strokeWidth: 0.1,
          })
        }
      }
    }
  }

  public getTileLevel(type: string, x: number, y: number) { return this.layers[type].get(x, y) }

  public setTileLevel(type: string, x: number, y: number, level: number) { this.layers[type].set(x, y, level) }

  public serialize(): { layers: { [type: string]: number[] }, roomName: string } {
    const resultLayers: { [type: string]: number[] } = {}
    for (const type in this.layers) { resultLayers[type] = this.layers[type].serialize() }
    return { layers: resultLayers, roomName: this.room.name }
  }
}
