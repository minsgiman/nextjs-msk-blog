---
title: logger 구현
date: '2021-04-09'
tags: ['logger', 'typescript']
draft: false
summary: 'logger 유틸 및 unit test 구현'
---

## logger 유틸 및 unit test 구현

#### logger 유틸

```typescript
/* logger.ts */

import { fx } from '@utils/fx'
import { hasKeys, findKey } from '@utils/object'

const LOG_LEVEL = {
  trace: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5,
} as const

type ILevelKeys = keyof typeof LOG_LEVEL
type ILevelValues = typeof LOG_LEVEL[ILevelKeys]
type ILogArgs = unknown[]

function convertToString(arg: unknown): string {
  const argType = typeof arg

  if (argType === 'string') {
    return arg as string
  } else if (argType === 'number' || argType === 'boolean') {
    return String(arg)
  } else if (argType === 'object') {
    try {
      return JSON.stringify(arg)
    } catch {
      console.error('Error to parsing object to string : ', arg)
      return ''
    }
  } else {
    return ''
  }
}

class Logger {
  private readonly defaultLevel = LOG_LEVEL.info
  private readonly defaultLevelKey = 'info'
  private currentLogLevel: ILevelValues

  constructor(level?: ILevelKeys) {
    this.currentLogLevel = level && hasKeys(LOG_LEVEL, level) ? LOG_LEVEL[level] : this.defaultLevel
  }

  private combineStr = (...args: ILogArgs): string => {
    return fx.process(
      [...args],
      fx.map(convertToString),
      fx.reduce((result: string, str: string) => {
        const addStr = `${result && str ? ' ' : ''}${str}`

        return result + addStr
      }, '')
    ) as string
  }

  private _log = (level: ILevelValues, ...args: ILogArgs) => {
    const key =
      (findKey(LOG_LEVEL, (v) => v === level) as ILevelKeys | undefined) || this.defaultLevelKey

    if (this.currentLogLevel <= level) {
      if (level <= LOG_LEVEL.debug) {
        console.log(...args) // LOG_LEVEL trace, debug use console.log
      } else {
        console[key](...args)
      }
    }
  }

  private _error = (error: Error | null, ...args: ILogArgs) => {
    if (this.currentLogLevel <= LOG_LEVEL.error) {
      error ? console.error(error, ...args) : console.error(...args)
    }
  }

  getCurrentLogLevel = () => {
    return findKey(LOG_LEVEL, (v) => v === this.currentLogLevel) as ILevelKeys | undefined
  }

  trace = (...args: ILogArgs) => {
    this._log(LOG_LEVEL.trace, ...args)
  }

  debug = (...args: ILogArgs) => {
    this._log(LOG_LEVEL.debug, ...args)
  }

  info = (...args: ILogArgs) => {
    this._log(LOG_LEVEL.info, ...args)
  }

  warn = (...args: ILogArgs) => {
    this._log(LOG_LEVEL.warn, ...args)
  }

  error = (error: Error | null, ...args: ILogArgs) => {
    this._error(error, ...args)
  }
}

export default new Logger(process.env.APP_LOG_LEVEL as ILevelKeys)
```

#### unit test

```typescript
/* logger.test.ts */

import { expect } from '@jest/globals'
import logger from './logger'

describe('info', () => {
  let infoSpy: jest.SpyInstance
  let errorSpy: jest.SpyInstance
  let warnSpy: jest.SpyInstance

  beforeEach(() => {
    infoSpy = jest.spyOn(console, 'info').mockImplementation()
    errorSpy = jest.spyOn(console, 'error').mockImplementation()
    warnSpy = jest.spyOn(console, 'warn').mockImplementation()
  })

  it('should be have message argument of string type when call to method', () => {
    const message = 'test'
    const error = new Error()

    logger.info(message)
    logger.error(error, message)
    logger.warn(message)

    expect(infoSpy).toHaveBeenCalledWith(message)
    expect(errorSpy).toHaveBeenCalledWith(error, message)
    expect(warnSpy).toHaveBeenCalledWith(message)
  })

  it('should be have message argument of number type when call to method', () => {
    const message = 1
    const error = new Error()

    logger.info(message)
    logger.error(error, message)
    logger.warn(message)

    expect(infoSpy).toHaveBeenCalledWith(message)
    expect(errorSpy).toHaveBeenCalledWith(error, message)
    expect(warnSpy).toHaveBeenCalledWith(message)
  })

  it('should be have message argument of boolean type when call to method', () => {
    const message = false

    logger.info(message)
    logger.error(null, message)
    logger.warn(message)

    expect(infoSpy).toHaveBeenCalledWith(message)
    expect(errorSpy).toHaveBeenCalledWith(message)
    expect(warnSpy).toHaveBeenCalledWith(message)
  })

  it('should be have message argument of object type when call to method', () => {
    const message = {}

    logger.info(message)
    logger.error(null, message)
    logger.warn(message)

    expect(infoSpy).toHaveBeenCalledWith(message)
    expect(errorSpy).toHaveBeenCalledWith(message)
    expect(warnSpy).toHaveBeenCalledWith(message)
  })

  it('should be have message argument of string type and style argument of string type', () => {
    const message = 'message: '
    const data = { test: 1 }
    const error = new Error()

    logger.info(message, data)
    logger.error(error, message, data)
    logger.warn(message, data)

    expect(infoSpy).toHaveBeenCalledWith(message, data)
    expect(errorSpy).toHaveBeenCalledWith(error, message, data)
    expect(warnSpy).toHaveBeenCalledWith(message, data)
  })
})
```
