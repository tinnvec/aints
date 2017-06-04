import { PheromoneNetwork } from './PheromoneNetwork'

export class LookTile extends RoomPosition {
  public readonly constructionSites: { [structureType: string]: ConstructionSite[] }
  public readonly creeps: Creep[]
  public readonly pheromones: { [pheromoneType: string]: number }
  public readonly resources: { [resourceType: string]: Resource[] }
  public readonly sources: Source[]
  public readonly structures: { [structureType: string]: Structure[] }
  public readonly terrain: string[]

  constructor(x: number, y: number, roomName: string) {
    super(x, y, roomName)

    this.creeps = this.lookFor<Creep>(LOOK_CREEPS)
    this.sources = this.lookFor<Source>(LOOK_SOURCES)
    this.terrain = this.lookFor<string>(LOOK_TERRAIN)

    this.resources = _.groupBy(this.lookFor<Resource>(LOOK_RESOURCES), ({ resourceType }) => resourceType)

    this.constructionSites =
      _.groupBy(this.lookFor<ConstructionSite>(LOOK_CONSTRUCTION_SITES), ({ structureType }) => structureType)
    this.structures = _.groupBy(this.lookFor<Structure>(LOOK_STRUCTURES), ({ structureType }) => structureType)

    this.pheromones = {}
    for (const pheromoneType in PheromoneNetwork.layers) {
      this.pheromones[pheromoneType] = PheromoneNetwork.getTypeLevelAt(pheromoneType, this.x, this.y, this.roomName)
    }
  }

  public getPheromoneLevels(searchPheromoneType: string): { searchLevel: number, otherLevel: number } {
    const result = { searchLevel: this.pheromones[searchPheromoneType] || 0, otherLevel: 0 }
    for (const pheromoneType in this.pheromones) {
      if (pheromoneType !== searchPheromoneType) { result.otherLevel += this.pheromones[pheromoneType] || 0 }
    }
    return result
  }

  public isWalkable(ignoreCreeps?: boolean) {
    if (_.includes(this.terrain, 'wall')) { return false }
    if (!ignoreCreeps && this.creeps.length > 0) { return false }
    if (_.intersection(_.keys(this.structures), OBSTACLE_OBJECT_TYPES).length > 0) { return false }
    return true
  }
}
