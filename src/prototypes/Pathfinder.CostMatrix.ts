PathFinder.CostMatrix.prototype.draw = function(this: CostMatrix, roomName: string, color: string = '#CCCCCC') {
  const vis = new RoomVisual(roomName)
  let x: number
  let y: number
  for (y = 0; y < 50; ++y) {
    for (x = 0; x < 50; ++x) {
      const str = this.get(x, y)
      if (str > 0) {
        vis.circle(x, y, {
          fill: color,
          opacity: 0.33,
          radius: str / (255 * 2),
          stroke: color,
          strokeWidth: 0.1,
        })
      }
    }
  }
}
