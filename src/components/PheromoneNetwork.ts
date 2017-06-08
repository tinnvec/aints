import * as Config from '../config/config'

export interface PheromoneLayer {
  [roomName: string]: {
    levels: CostMatrix,
    decayTimes: { [xy: string]: number }
  }
}

export class PheromoneNetwork {
  public static layers: { [pheromoneType: string]: PheromoneLayer } = { controller: {}, energy: {} }

  public static getTypeLevelAt(pheromoneType: string, x: number, y: number, roomName: string) {
    if (this.layers[pheromoneType][roomName] === undefined) {
      this.layers[pheromoneType][roomName] = { levels: new PathFinder.CostMatrix(), decayTimes: {} }
    }
    return this.layers[pheromoneType][roomName].levels.get(x, y)
  }

  public static setTypeLevelAt(pheromoneType: string, level: number, x: number, y: number, roomName: string) {
    this.layers[pheromoneType][roomName].levels.set(x, y, level)
    this.layers[pheromoneType][roomName].decayTimes[`${x},${y}`] = Config.PHEROMONE_DECAY_TIME
  }
}
