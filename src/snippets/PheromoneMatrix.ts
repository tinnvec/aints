export default class PheromoneMatrix {
  public static readonly MAX_LEVEL = (2 - Math.pow(2, -23)) * Math.pow(2, 127) // Max Float32 (Single Point Precision)

  public static deserialize(data: number[]) {
    return new PheromoneMatrix(new Float32Array(new Float64Array(data).buffer))
  }

  private _bits: Float32Array

  constructor(bits?: Float32Array) {
      this._bits = bits === undefined ? new Float32Array(2500) : bits
  }

  public clone() {
    return new PheromoneMatrix(this._bits.slice())
  }

  public draw(roomName: string, color: string = '#CCCCCC') {
    const vis = new RoomVisual(roomName)
    let x: number
    let y: number
    let size: number
    let max = 0
    for (y = 0; y < 50; ++y) {
      for (x = 0; x < 50; ++x) {
        max = Math.max(max, this.get(x, y))
      }
    }
    for (y = 0; y < 50; ++y) {
      for (x = 0; x < 50; ++x) {
        size = this.get(x, y)
        if (size > 0) { vis.circle(x, y, { fill: color, opacity: 0.5, radius: (size / max) / 2 }) }
      }
    }
  }

  public get(x: number, y: number) {
    return this._bits[x * 50 + y]
  }

  public serialize(): number[] {
    return Array.prototype.slice.apply(new Float64Array(this._bits.buffer))
  }

  public set(x: number, y: number, value: number) {
    this._bits[x * 50 + y] = Math.min(Math.max(0, value), PheromoneMatrix.MAX_LEVEL)
  }
}
