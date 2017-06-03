import { ProcessConstructor } from './Process'

interface Registry {
  [processName: string]: ProcessConstructor | undefined
}

export class ProcessRegistry {
  public static register(constructor: ProcessConstructor): void {
    ProcessRegistry.registry[constructor.name] = constructor
  }

  public static fetch(processName: string): ProcessConstructor | undefined {
    return ProcessRegistry.registry[processName]
  }

  private static readonly registry: Registry = {}
}
