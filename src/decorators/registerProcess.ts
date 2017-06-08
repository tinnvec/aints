import { ProcessConstructor } from '../components/Process'
import { ProcessRegistry } from '../components/ProcessRegistry'

export function registerProcess(constructor: ProcessConstructor) {
  ProcessRegistry.register(constructor)
}
