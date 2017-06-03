export class PheromoneNetwork {
  public static layers: { [pheromoneType: string]: { [roomName: string]: CostMatrix } } = { controller: {}, energy: {} }

  public static decay() {
    const rate = 1
    let x: number
    let y: number
    for (const pheromoneType in this.layers) {
      for (const roomName in this.layers[pheromoneType]) {
        for (x = 0; x < 50; x++) {
          for (y = 0; y < 50; y++) {
            const curr = this.layers[pheromoneType][roomName].get(x, y)
            if (curr === 0) { continue }
            this.layers[pheromoneType][roomName].set(x, y, curr - rate)
          }
        }
      }
    }
  }

  public static getTypeLevelAt(pheromoneType: string, x: number, y: number, roomName: string) {
    this.layers[pheromoneType][roomName] = this.layers[pheromoneType][roomName] || new PathFinder.CostMatrix()
    return this.layers[pheromoneType][roomName].get(x, y)
  }

  public static setTypeLevelAt(pheromoneType: string, level: number, x: number, y: number, roomName: string) {
    this.layers[pheromoneType][roomName].set(x, y, level)
  }
}

// public diffuse() {
//   const rate = 0.01
//   const min = 4
//   let x: number
//   let y: number
//   for (const type in this.layers) {
//     for (x = 0; x < 50; x++) {
//       for (y = 0; y < 50; y++) {
//         const curr = this.layers[type].get(x, y)
//         if (curr < min) { continue }
//         const amt = Math.max(Math.floor(curr * rate), 1)
//         const DIRECTION_COORDINATE_DELTAS: { [dir: number]: [number, number] } = {
//           8: [-1, -1],  1: [0, -1],  2: [1, -1],
//           7: [-1, 0],   /*Center*/   3: [1, 0],
//           6: [-1, 1],   5: [0, 1],   4: [1, 1]
//         }
//         const nearbyTiles: Array<{ amount: number, x: number, y: number}> = []
//         for (const dir in DIRECTION_COORDINATE_DELTAS) {
//           const [dx, dy] = DIRECTION_COORDINATE_DELTAS[dir]
//           const nx = x + dx
//           const ny = y + dy
//           if (nx < 0 || ny < 0 || nx > 49 || ny > 49) { continue }
//           const nearbyCurr = this.layers[type].get(nx, ny)
//           if (nearbyCurr >= curr) { continue }
//           nearbyTiles.push({ amount: nearbyCurr, x: nx, y: ny })
//         }
//         if (nearbyTiles.length < 1) { continue }
//         const lowestNearby = _(nearbyTiles).shuffle().min(({ amount }) => amount)
//         this.layers[type].set(lowestNearby.x, lowestNearby.y, Math.min(lowestNearby.amount + amt, 255))
//         this.layers[type].set(x, y, Math.max(curr - amt, 0))
//       }
//     }
//   }
// }

// public draw(layer: string, color: string = '#CCCCCC') {
//   const vis = new RoomVisual(this.room.name)
//   let x: number
//   let y: number
//   for (y = 0; y < 50; ++y) {
//     for (x = 0; x < 50; ++x) {
//       const str = this.getTileLevel(layer, x, y)
//       if (str > 0) {
//         vis.circle(x, y, {
//           fill: color,
//           opacity: 1 / ((Object.keys(this.layers).length) * 2),
//           radius: str / (Config.PHEROMONE_MAX_TILE_AMOUNT * 2),
//           stroke: color,
//           strokeWidth: 0.1,
//         })
//       }
//     }
//   }
// }
