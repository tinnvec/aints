import { LogLevels } from '../lib/logger/logLevels'

/* --- AInts Specific Config --- */

export const ENABLE_ROOM_VISUALS: boolean = true

export const PHEROMONE_MAX_TILE_AMOUNT: number = 255
export const PHEROMONE_DECAY_TIME: number = 9

export const CREEP_MAX_SEARCH_STEPS: number = Math.floor(PHEROMONE_MAX_TILE_AMOUNT / 2)
export const CREEP_MAX_STUCK_TICKS = 10
export const CREEP_SEARCH_IGNORE_CREEPS_CHANCE = 0.25

/* --- Default Config --- */

/**
 * Enable this if you want a lot of text to be logged to console.
 * @type {boolean}
 */
export const ENABLE_DEBUG_MODE: boolean = true

/**
 * Enable this to enable screeps profiler
 */
export const USE_PROFILER: boolean = true

/**
 * Debug level for log output
 */
export const LOG_LEVEL: number = LogLevels.DEBUG

/**
 * Prepend log output with current tick number.
 */
export const LOG_PRINT_TICK: boolean = true

/**
 * Prepend log output with source line.
 */
export const LOG_PRINT_LINES: boolean = true

/**
 * Load source maps and resolve source lines back to typeascript.
 */
export const LOG_LOAD_SOURCE_MAP: boolean = true

/**
 * Maximum padding for source links (for aligning log output).
 */
export const LOG_MAX_PAD: number = 100

/**
 * VSC location, used to create links back to source.
 * Repo and revision are filled in at build time for git repositories.
 */
// export const LOG_VSC = { repo: "@@_repo_@@", revision: "@@_revision_@@", valid: false };
export const LOG_VSC = { repo: '@@_repo_@@', revision: __REVISION__, valid: false }

/**
 * URL template for VSC links, this one works for github and gitlab.
 */
export const LOG_VSC_URL_TEMPLATE = (path: string, line: string) => {
  return `${LOG_VSC.repo}/blob/${LOG_VSC.revision}/${path}#${line}`
}
