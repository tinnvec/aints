import * as Profiler from 'screeps-profiler'

// tslint:disable-next-line
export default function Profile(constructor: Function): void {
  Profiler.registerClass(constructor, constructor.name)
}
