interface Memory {
  log: any
  structures: { [id: string]: any }
}

declare const __REVISION__: string;


// --- Interfaces ---

interface Room {
  readonly pheromoneNetwork: PheromoneNetwork

  _pheromoneNetwork?: PheromoneNetwork

  getWalkableTerrainAt(x: number, y: number, ignoreCreeps?: boolean): boolean
}

interface Structure {
  memory: any

  run(): void
}
