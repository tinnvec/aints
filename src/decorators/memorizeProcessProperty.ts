import { Process } from '../components/Process'

export function memorizeProcessProperty(defaultValue: any): PropertyDecorator {
  return (target: any, key: string) => {
    if (!(delete target[key])) { return }
    return {
      configurable: true,
      enumerable: true,
      get(this: Process) {
        if (this.memory[key] === undefined) { this.memory[key] = defaultValue }
        return this.memory[key]
      },
      set(this: Process, value: any) { this.memory[key] = value }
    }
  }
}
