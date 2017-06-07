interface Structure {
  memory: any
}


// --- Properties ---

Object.defineProperty(Structure.prototype, 'memory', {
  configurable: true,
  get(this: Structure) {
    let mem = Memory.structures[this.id]
    if (mem === undefined) {
      mem = {}
      Memory.structures[this.id] = mem
    }
    return mem
  },
  set(this: Structure, value: any) {
    Memory.structures[this.id] = value
  }
})
