interface Memory {
  log: any
  structures: { [id: string]: any }
}

declare const __REVISION__: string;


// --- Interfaces ---

interface PheromoneNetwork {
  layers: { [type: string]: CostMatrix }

  dissipate(): void
  draw(type: string, color?: string): void
  getLevel(type: string, x: number, y: number): number
  increaseLevel(type: string, x: number, y: number, amount: number): void
  serialize(): { layers: { [type: string]: number[] }, roomName: string }
}

interface Room {
  readonly pheromoneNetwork: PheromoneNetwork

  _pheromoneNetwork?: PheromoneNetwork

  getWalkableTerrainAt(x: number, y: number, ignoreCreeps?: boolean): boolean
}

interface Structure {
  memory: any

  run(): void
}
