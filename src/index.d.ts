interface Memory {
  log: any
  structures: { [id: string]: any }
}

declare const __REVISION__: string;

// --- Interfaces ---

interface Creep {
  _currentDepositPheromone?: string
  _currentSearchPheromone?: string
  _directionPriorities?: number[]
  _isCaryingEnergy?: boolean
  _isHarvesting?: boolean
  _isSearching?: boolean
  _lastDirection?: number
  _lastMoveWasSuccessful?: boolean
  _lastPheromoneDepositAmount?: number
  _nearbySource?: Source
  _nearbySpawn?: Spawn
  _nearbyTiles?: Array<{ dir: number, tile: LookTile }>
  _stepsFromLastSite?: number
  readonly currentDepositPheromone: string | undefined
  readonly currentSearchPheromone: string
  readonly directionPriorities: number[]
  readonly isCarryingEnergy: boolean
  readonly isHarvesting: boolean
  readonly nearbySource?: Source
  readonly nearbySpawn?: Spawn
  readonly nearbyTiles: Array<{ dir: number, tile: LookTile }>
  isSearching: boolean
  lastPheromoneDepositAmount: number
  lastMoveWasSuccessful: boolean
  lastDirection?: number
  stepsFromLastSite: number
  run(): void
  depositPheromone(): number
  getSearchPheromoneDirection(): number
  searchMove(): boolean
}

interface LookTile extends RoomPosition {
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
  decay(): void
  diffuse(): void
  draw(type: string, color?: string): void
  getTileLevel(type: string, x: number, y: number): number
  setTileLevel(type: string, x: number, y: number, amount: number): void
  serialize(): { layers: { [type: string]: number[] }, roomName: string }
}

interface Room {
  _lookTiles?: LookTile[]
  _pheromoneNetwork?: PheromoneNetwork
  readonly lookTiles: LookTile[]
  readonly pheromoneNetwork: PheromoneNetwork
  run(): void
  store(): void
  draw(): void
  getLookTile(x: number, y: number): LookTile | undefined
}

interface Structure {
  memory: any
  run(): void
}
