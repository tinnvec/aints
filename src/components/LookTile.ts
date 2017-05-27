import Profile from '../lib/screeps-profiler/Profile'

@Profile
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

    this.room = Game.rooms[roomName]

    this.creeps = this.lookFor<Creep>(LOOK_CREEPS)
    this.sources = this.lookFor<Source>(LOOK_SOURCES)
    this.terrain = this.lookFor<string>(LOOK_TERRAIN)

    this.constructionSites =
      _.groupBy(this.lookFor<ConstructionSite>(LOOK_CONSTRUCTION_SITES), ({ structureType }) => structureType)
    this.structures = _.groupBy(this.lookFor<Structure>(LOOK_STRUCTURES), ({ structureType }) => structureType)

    this.pheromones = {}
    for (const type in this.room.pheromoneNetwork.layers) {
      this.pheromones[type] = this.room.pheromoneNetwork.getTileLevel(type, this.x, this.y)
    }
  }

  public isWalkable(ignoreCreeps?: boolean) {
    if (_.includes(this.terrain, 'wall')) { return false }
    if (!ignoreCreeps && this.creeps.length > 0) { return false }
    if (_.intersection(_.keys(this.structures), OBSTACLE_OBJECT_TYPES).length > 0) { return false }
    return true
  }
}
