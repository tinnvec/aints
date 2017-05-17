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
  _directionPheromoneLevels?: DirectionPheromoneLevels[]

  readonly isCarryingEnergy: boolean
  readonly directionPheromoneLevels: DirectionPheromoneLevels[]

  currentDepositPheromone: string | undefined
  currentSearchPheromone: string
  currentSourceId: string | undefined
  homePosition: RoomPosition
  isSearching: boolean
  lastMoveWasSuccessful: boolean
  lastPheromoneDepositAmount: number
  stepsFromLastSite: number

  run(): void

  depositPheromone(): number
  getCurrentLocationPheromoneLevel(type: string): number
  getLocationPheromoneLevel(type: string, x: number, y: number): number
  getSearchPheromoneDirection(): number
  searchMove(): boolean
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
  readonly pheromoneNetwork: PheromoneNetwork

  _pheromoneNetwork?: PheromoneNetwork

  getWalkableTerrainAt(x: number, y: number, ignoreCreeps?: boolean): boolean
}

interface Structure {
  memory: any

  run(): void
}
