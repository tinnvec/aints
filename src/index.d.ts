declare const __REVISION__: string;

type RoomVisualOptions = {
  color?: string
  opacity?: number
}

interface Creep {
  nearbyLookTiles: Array<{ dir: number, tile: LookTile }>
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

interface Memory {
  log: any
  pidCounter: number
  processMemory: any
  processTable: any
}

interface Room {
  _lookTiles?: LookTile[]
  readonly lookTiles: LookTile[]
  // draw(): void
  getLookTile(x: number, y: number): LookTile | undefined
}

interface RoomVisual {
  connectRoads(opts?: RoomVisualOptions): void
  speech(text: string, x: number, y: number): void
  structure(x: number, y: number, type: string, opts?: RoomVisualOptions): void
  test(): void
}
