---
title: functional extention 유틸
date: '2021-06-30'
tags: ['functional programming', 'typescript']
draft: false
summary: 'functional extention 유틸 및 unit test 구현'
---

## functional extention 유틸 및 unit test 구현

#### functional extention 유틸

```typescript
/* fx.ts */

const curry = function (func: Function) {
  return (...curryParams: unknown[]) => {
    return (...args: unknown[]) => func(...curryParams, ...args) as unknown;
  };
};

const map = function* (callback: Function, iterable: Iterable<unknown>) {
  for (const item of iterable) {
    yield callback(item);
  }
};

const filter = function* (callback: Function, iterable: Iterable<unknown>) {
  for (const item of iterable) {
    if (callback(item)) yield item;
  }
};

const take = function* (length: number, iterable: Iterable<unknown>) {
  let count = 0;

  for (const item of iterable) {
    yield item;
    count += 1;
    if (count >= length) {
      break;
    }
  }
};

const head = (iterable: Iterator<unknown>) => {
  const first: IteratorResult<unknown, unknown> = iterable.next();

  return first.value;
};

const all = (iterable: Iterable<unknown>) => {
  return Array.from(iterable);
};

const values = function* (obj: { [key: string]: unknown }) {
  for (const key in obj) {
    yield obj[key];
  }
};

const keys = function* (obj: { [key: string]: unknown }) {
  for (const key in obj) {
    yield key;
  }
};

const entries = function* (obj: { [key: string]: unknown }) {
  for (const key in obj) {
    yield [key, obj[key]];
  }
};

const sort = (result: (string | number)[], item: string | number) => {
  let index = 0;
  while (index < result.length && item > result[index]) {
    index += 1;
  }
  result.splice(index, 0, item);
  return result;
};

const sortDesc = (result: (string | number)[], item: string | number) => {
  let index = 0;
  while (index < result.length && item < result[index]) {
    index += 1;
  }
  result.splice(index, 0, item);
  return result;
};

const reduce = (callback: Function, initial: unknown, iterable: Iterable<unknown>) => {
  let result = initial;

  for (const item of iterable) {
    result = callback(result, item);
  }

  return result;
};

const fromEntries = (iterable: Iterable<unknown>) => {
  return reduce(
    (obj: { [key: string]: unknown }, [key, value]: [key: string, value: unknown]) => {
      obj[key] = value;
      return obj;
    },
    {},
    iterable
  );
};

const run = <R = unknown, T = unknown>(initial: T, ...funcList: Function[]): R => {
  return reduce(
    (result: unknown, func: Function) => func(result) as unknown,
    initial,
    funcList
  ) as R;
};

export default {
  curry,
  run,
  values,
  keys,
  entries,
  fromEntries,
  sort,
  sortDesc,
  head,
  all,
  map: curry(map),
  filter: curry(filter),
  take: curry(take),
  reduce: curry(reduce),
};
```

#### unit test

```typescript
/* fx.test.ts */

import { expect } from '@jest/globals';
import fx from './fx';

describe('function extention', () => {
  it('should add process work', () => {
    const result = fx.run(
      0,
      (item: number) => item + 1,
      (item: number) => item + 10,
      (item: number) => item + 100
    );

    expect(result).toBe(111);
  });

  it('should filter, map, reduce process work', () => {
    const result = fx.run(
      [1, 2, 3, 4, 5],
      fx.filter((item: number) => item % 2),
      fx.map((item: number) => item * item),
      fx.take(2),
      fx.reduce((acc: number, item: number) => acc + item, 0)
    );

    expect(result).toBe(10);
  });

  it('should entries, fromEntries work', () => {
    const result = fx.run<{ a?: number; b?: number; c?: number }>(
      { a: 1, b: 2, c: 3 },
      fx.entries,
      fx.filter((item: unknown[]) => item[0] === 'c'),
      fx.fromEntries
    );

    expect(result['a']).toBeUndefined();
    expect(result['c']).toBe(3);
  });

  it('should get zero when process reduce with empty array', () => {
    const result = fx.run(
      [],
      fx.map((item: number) => item * item),
      fx.reduce((acc: number, item: number) => acc + item, 0)
    );

    expect(result).toBe(0);
  });

  it('should find object key with keys, filter, take, head process', () => {
    const logLevel: { [key: string]: unknown } = {
      debug: 1,
      info: 2,
      warn: 3,
      error: 4,
    };

    const result = fx.run(
      logLevel,
      fx.keys,
      fx.filter((key: string) => {
        return logLevel[key] === logLevel.info;
      }),
      fx.take(1),
      fx.head
    );
    expect(result).toBe('info');
  });

  it('should get undefined when process with null and undefined', () => {
    const resultWithNull = fx.run(
      null,
      fx.keys,
      fx.map((key: string) => key + 'str'),
      fx.take(1),
      fx.head
    );
    const resultWithUndefined = fx.run(
      undefined,
      fx.keys,
      fx.map((key: string) => key + 'str'),
      fx.take(1),
      fx.head
    );
    expect(resultWithNull).toBeUndefined();
    expect(resultWithUndefined).toBeUndefined();
  });

  it('should get sorted string array', () => {
    const result = fx.run<string[]>(['b', 'c', 'a'], fx.reduce(fx.sort, []));
    expect(result[0]).toBe('a');
  });
});
```
