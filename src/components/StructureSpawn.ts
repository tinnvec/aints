// --- Constants ---

const CREEP_BODY = [MOVE, MOVE, WORK, CARRY, MOVE]

// --- Methods ---

StructureSpawn.prototype.run = function(this: StructureSpawn) {
  if (this.canCreateCreep(CREEP_BODY) === OK) { this.createCreep(CREEP_BODY) }
}
