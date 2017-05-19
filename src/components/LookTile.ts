export default class LookTile extends RoomPosition {
  public readonly constructionSites: { [structureType: string]: ConstructionSite[] }
  public readonly creeps: Creep[]
  public readonly pheromones: { [type: string]: number }
  public readonly sources: Source[]
  public readonly structures: { [structureType: string]: Structure[] }
  public readonly terrain: string[]

  private room: Room

  constructor(x: number, y: number, roomName: string) {
    super(x, y, roomName)

    this.constructionSites = {}
    this.creeps = []
    this.pheromones = {}
    this.sources = []
    this.structures = {}
    this.terrain = []

    this.room = Game.rooms[roomName]

    for (const lookResult of this.look()) {
      switch (lookResult.type) {
        case LOOK_CREEPS:
          if (lookResult.creep === undefined) { break }
          this.creeps.push(lookResult.creep)
          break
        // case LOOK_ENERGY:
        // case LOOK_RESOURCES:
        case LOOK_SOURCES:
          if (lookResult.source === undefined) { break }
          this.sources.push(lookResult.source)
          break
        // case LOOK_MINERALS:
        case LOOK_STRUCTURES:
          if (lookResult.structure === undefined) { break }
          const structure = lookResult.structure
          const structureType = structure.structureType
          if (this.structures[structureType] === undefined) { this.structures[structureType] = [] }
          this.structures[structureType].push(structure)
          break
        // case LOOK_FLAGS:
        case LOOK_CONSTRUCTION_SITES:
          if (lookResult.constructionSite === undefined) { break }
          const constructionSite = lookResult.constructionSite
          const csStructureType = constructionSite.structureType
          if (this.constructionSites[csStructureType] === undefined) { this.constructionSites[csStructureType] = [] }
          this.constructionSites[csStructureType].push(constructionSite)
          break
        // case LOOK_NUKES:
        case LOOK_TERRAIN:
          if (lookResult.terrain === undefined) { break }
          this.terrain.push(lookResult.terrain)
          break
        // case 'exit':
        default:
      }
    }

    for (const type in this.room.pheromoneNetwork.layers) {
      this.pheromones[type] = this.room.pheromoneNetwork.getLevel(type, this.x, this.y)
    }
  }

  public isWalkable(ignoreCreeps?: boolean) {
    if (
      _.includes(this.terrain, 'wall') ||
      (!ignoreCreeps && this.creeps.length > 0) ||
      _.intersection(_.union(_.keys(this.structures), _.keys(this.constructionSites)), OBSTACLE_OBJECT_TYPES).length > 0
    ) {
      return false
    }
    return true
  }
}
