---
title: Conditional Types
date: '2022-09-10'
tags: ['typescript']
draft: false
summary: 'Typescript의 Exclude, Extract, NonNullable, Parameters and ReturnType 유틸리티 타입은 내부적으로 어떻게 구현되어 있을까?'
---

### Conditional Types

Typescript의 Exclude, Extract, NonNullable, Parameters and ReturnType 유틸리티 타입은 내부적으로 어떻게 구현되어 있을까? <br />
이 유틸리티 타입들은 Conditional Types 를 기반으로 구현되어 있다.

Conditional Types를 기반으로 어떻게 유틸리티 타입들이 구현되어 있는지 살펴본다.

```ts
type Exclude<T, U> = T extends U ? never : T;

type Extract<T, U> = T extends U ? T : never;

type NonNullable<T> = T extends null | undefined ? never : T;

type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;

type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
```

```ts
type T0 = Exclude<'a' | 'b' | 'c', 'a'>;
// type T0 = 'b' | 'c'

type T1 = Extract<'a' | 'b' | 'c', 'a' | 'f'>;
// type T1 = 'a'

type T2 = NonNullable<string | number | undefined>;
// type T2 = string | number

type T3 = Parameters<(s: string) => void>;
// type T3 = [s: string]
```

Conditional Types 의 sytax는 다음과 같다.

<img src="/static/images/conditional-types.png" width="500" />

이는 다음과 같은 의미를 가진다. <br />

```
T가 타입 U에 assign이 가능하면, X를 리턴하고 그렇지 않으면 Y를 리턴한다.
```

Conditional Types을 통해 generic type의 조건에 따라 type을 결정할 수 있다.

<br />

### Conditional Types 사용 예제

Conditional Types의 예제를 살펴보자. <br />
조건에 따라 type이 결정된다.

```ts
type IsString<T> = T extends string ? true : false;
type I0 = IsString<number>; // false
type I1 = IsString<'abc'>; // true
type I2 = IsString<any>; // boolean
type I3 = IsString<never>; // never
```

```ts
type TypeName<T> = T extends string
  ? 'string'
  : T extends number
  ? 'number'
  : T extends boolean
  ? 'boolean'
  : T extends undefined
  ? 'undefined'
  : T extends Function
  ? 'function'
  : 'object';

type T0 = TypeName<string>; // 'string'
type T1 = TypeName<'a'>; // 'string'
type T2 = TypeName<true>; // 'boolean'
type T3 = TypeName<() => void>; // 'function'
type T4 = TypeName<string[]>; // 'object'
```

그러면 Conditional Types에 union type을 넘기면 어떻게 동작할까?

```ts
type T10 = TypeName<string | (() => void)>;
// "string" | "function"

type T11 = TypeName<string | string[] | undefined>;
// "string" | "object" | "undefined"
```

위의 결과에서 보는 것처럼 union type을 리턴한다.
이는 Conditional Types이 아래와 같이 Union 을 각각 분리하여 처리하기 때문이다.

```
T extends U ? X : Y

T => A | B | C

A | B | C extends U ? X : Y  =>

(A extends U ? X : Y) | (B extends U ? X : Y) | (C extends U ? X : Y)
```

이제 Exclude의 동작하는 방식도 다음과 같이 이해할 수 있다.

```
type Exclude<T, U> = T extends U ? never : T;
type T4 = Exclude<"a" | "b" | "c", "a" | "b">
​
("a" extends "a" | "b" ? never : "a") // => never
| ("b" extends "a" | "b" ? never : "b") // => never
| ("c" extends "a" | "b" ? never : "c") // => "c"
​
never | never | "c" // => "c"
```

Conditional Types를 활용하여 아래 예제에서 처럼 function type과 non-function type을 쉽게 추출할 수 있다.

```ts
type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

interface User {
  id: number;
  name: string;
  age: number;
  updateName(newName: string): void;
}
type T5 = FunctionPropertyNames<User>; // "updateName"
type T6 = FunctionProperties<User>; // { updateName: (newName: string) => void; }
type T7 = NonFunctionPropertyNames<User>; // "id" | "name" | "age"
type T8 = NonFunctionProperties<User>; // { id: number; name: string; age: number; }
```

---

### 참조

- [Using TypeScript Conditional Types Like a Pro](https://javascript.plainenglish.io/use-typescript-conditional-types-like-a-pro-7baea0ad05c5)
