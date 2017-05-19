interface Memory {
  log: any
  structures: { [id: string]: any }
}

declare const __REVISION__: string;

// --- Types ---

type DirectionPheromoneLevels = {
  dir: number
  depositPheromoneLevel: number
  searchPheromoneLevel: number
}

// --- Interfaces ---

interface Creep {
  _nearbyTiles?: Array<{ dir: number, tile: LookTile }>
  readonly isCarryingEnergy: boolean
  readonly nearbyTiles: Array<{ dir: number, tile: LookTile }>
  currentDepositPheromone: string | undefined
  currentSearchPheromone: string
  isHarvesting: boolean
  isSearching: boolean
  lastMoveWasSuccessful: boolean
  lastPheromoneDepositAmount: number
  lastDirection?: number
  nearbySource?: Source
  nearbySpawn?: Spawn
  stepsFromLastSite: number
  run(): void
  depositPheromone(): number
  getDirectionPriorities(): number[]
  getSearchPheromoneDirection(): number
  searchMove(): boolean
}

interface LookTile {
  constructionSites: { [structureType: string]: ConstructionSite[] }
  creeps: Creep[]
  pheromones: { [type: string]: number }
  sources: Source[]
  structures: { [structureType: string]: Structure[] }
  terrain: string[]
  isWalkable(ignoreCreeps?: boolean): boolean
}

interface PheromoneNetwork {
  layers: { [type: string]: CostMatrix }
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
