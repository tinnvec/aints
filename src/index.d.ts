interface Memory {
  log: any
}

declare function require(path: string): any;

interface Global {
  log: any
}

declare var global: Global;
