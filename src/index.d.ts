interface Memory {
  log: any
  structures: { [id: string]: any }
}

declare const __REVISION__: string;

// --- Interfaces ---

interface Creep {
  _nearbyTiles?: Array<{ dir: number, tile: LookTile }>
  readonly isCarryingEnergy: boolean
  readonly currentDepositPheromone: string | undefined
  readonly currentSearchPheromone: string
  readonly directionPriorities: number[]
  readonly isHarvesting: boolean
  readonly nearbySource?: Source
  readonly nearbySpawn?: Spawn
  readonly nearbyTiles: Array<{ dir: number, tile: LookTile }>
  isSearching: boolean
  lastMoveWasSuccessful: boolean
  lastDirection?: number
  stepsFromLastSite: number
  run(): void
  depositPheromone(): number
  getSearchPheromoneDirection(): number
  searchMove(): boolean
}

interface LookTile {
  readonly constructionSites: { [structureType: string]: ConstructionSite[] }
  readonly creeps: Creep[]
  readonly pheromones: { [type: string]: number }
  readonly sources: Source[]
  readonly structures: { [structureType: string]: Structure[] }
  readonly terrain: string[]
  isWalkable(ignoreCreeps?: boolean): boolean
}

interface PheromoneNetwork {
  readonly layers: { [type: string]: CostMatrix }
  diffuse(): void
  dissipate(): void
  draw(type: string, color?: string): void
  getLevel(type: string, x: number, y: number): number
  increaseLevel(type: string, x: number, y: number, amount: number): void
  serialize(): { layers: { [type: string]: number[] }, roomName: string }
}

interface Room {
  _pheromoneNetwork?: PheromoneNetwork
  readonly pheromoneNetwork: PheromoneNetwork
}

interface Structure {
  memory: any
  run(): void
}
