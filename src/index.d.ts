declare const __REVISION__: string;

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
