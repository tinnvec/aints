interface Memory {
  log: any
  structures: { [id: string]: any }
}

declare const __REVISION__: string;
interface Structure {
  memory: any

  run(): void
}
