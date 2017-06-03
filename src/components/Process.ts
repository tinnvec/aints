import { Kernel } from './Kernel'

export enum ProcessPriority {
  High = 1,
  Normal,
  Low
}

export enum ProcessStatus {
  Dead = 0,
  Alive
}

export interface Process {
  memory: any
  parentPID: number
  pid: number
  priority: ProcessPriority
  status: ProcessStatus

  setMemory(memory: any): void
  stop(): void
}

export interface ProcessConstructor {
  new (parentPID: number, pid?: number, priority?: ProcessPriority): Process
}

export abstract class Process {
  public memory: any
  public parentPID: number
  public pid: number
  public priority: ProcessPriority
  public status: ProcessStatus

  constructor(parentPID: number, pid?: number, priority = ProcessPriority.Normal) {
    this.pid = pid !== undefined ? pid : Kernel.getNextPID()
    this.parentPID = parentPID
    this.priority = priority

    this.memory = {}
    this.status = ProcessStatus.Alive
  }

  public abstract run(): void
  public setMemory(memory: any) { this.memory = memory }
  public stop() { Kernel.killProcess(this.pid) }
}
