export default class WeightedSelector {
  private items: Array<[any, number]>

  constructor(items: Array<[any, number]> = []) {
    this.items = items
  }

  public addItem(item: [any, number]) {
    this.items.push(item)
  }

  public addItems(items: Array<[any, number]>) {
    this.items = this.items.concat(items)
  }

  public choose(): any {
    const totalWeight = this.items.reduce(((a, b) => a + b[1]), 0)
    const randNum = Math.random()
    let weightSum = 0
    for (const item of this.items) {
      weightSum += item[1] / totalWeight
      if (randNum < weightSum) { return item[0] }
    }
  }
}
