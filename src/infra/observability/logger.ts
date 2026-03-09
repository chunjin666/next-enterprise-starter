import type { Logger } from 'pino';
import pino from 'pino'
import { getLogContext } from './logger-context-injector'

const isDev = process.env.NODE_ENV === 'development'
const isBrowser = typeof window !== 'undefined'

const pinoConfig: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || 'info',
  browser: {
    asObject: true,
  },
  mixin() {
    if (isBrowser) return {}
    return getLogContext()
  },
  transport: (isDev && !isBrowser)
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          // translateTime: 'SYS:standard',
          // ignore: 'pid,hostname',
        },
      }
    : undefined,
}

export const rootLogger = pino(pinoConfig)

export const logger = rootLogger

export const info = logger.info.bind(logger)
export const warn = logger.warn.bind(logger)
export const error = logger.error.bind(logger)
export const debug = logger.debug.bind(logger)
export const fatal = logger.fatal.bind(logger)
export const trace = logger.trace.bind(logger)
export const child = logger.child.bind(logger)

export type { Logger }
