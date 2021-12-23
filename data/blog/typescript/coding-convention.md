---
title: Typescript 코딩 컨벤션
date: '2021-03-18'
tags: ['typescript']
draft: false
summary: 'Typescript 코딩 컨벤션을 정리하였다.'
---

## Interface 및 Type 변수명

`mandatory`

PascalCase를 사용하고, 명시적으로 type 정의인 것을 표현하기 위해 'I-' prefix를 따로 붙이지 않는다.

```ts
// bad
interface IFloatingMenuButtonProps {
  labelText: string
  onClick?: () => void
}
type IRadioValue = string | number | boolean | undefined
```

```ts
// good
interface FloatingMenuButtonProps {
  labelText: string
  onClick?: () => void
}
type RadioValue = string | number | boolean | undefined
```

## type vs interface

`optional`

union 또는 intersection을 사용할 때 type을 사용하고, extends 또는 implements를 사용할 때 interface를 사용한다.<br />
그 외의 경우에는 잘 판단해서 사용한다.

```ts
type EmailConfig = {
  // ...
}

type DbConfig = {
  // ...
}

type Config = EmailConfig | DbConfig

// ...

interface Shape {
  // ...
}

class Circle implements Shape {
  // ...
}

interface BigShape extends Shape {
  // ...
}
```

## 컴포넌트 props 정의

`mandatory`

컴포넌트 props는 끝에 "Props" suffix를 붙인다. <br />
위의 `type vs interface` 내용을 참고하여 적절하게 type or interface를 사용한다.

```ts
type EnforcedPopupProps {
  onClose: () => void;
  onExit: () => void;
}
```

## 함수 args 정의

`mandatory`

함수 args 는 끝에 "Args" suffix를 붙인다.

```ts
type LoginArgs = {
  isRedirectAfterLogin?: boolean
  reConsent?: boolean
  pathname?: string
}
```

## API 타입 정의

`mandatory`

API 관련 타입 정의는 끝에 "Response" "Request" suffix를 붙인다.

```ts
type CustomerStatusResponse = {
  guestStatus: string
  externalId: string
  customerId: string
  loanUserId: string
}

type CustomerStatusRequest = {
  customerId: string
}
```

## enum 대신 Union type 사용

`mandatory`

> 참고 : [TypeScript enum을 사용하지 않는 게 좋은 이유](https://engineering.linecorp.com/ko/blog/typescript-enum-tree-shaking/)

tree-shaking을 위해 enum 대신 Union type을 사용한다.

```ts
// bad
export enum POPUP_TARGET {
  INIT = 'INIT',
  INTRO = 'INTRO',
  MAIN = 'MAIN',
}
```

```ts
// good
export const POPUP_TARGET = {
  INIT: 'INIT',
  INTRO: 'INTRO',
  MAIN: 'MAIN',
} as const
export type POPUP_TARGET = typeof POPUP_TARGET[keyof typeof POPUP_TARGET]
```

## Type assertion

`mandatory`

type assertion시에 "as" syntax를 사용하고 angle-bracket syntax는 사용하지 않는다.

```ts
interface Foo {
  foo: string
}

// bad
console.log((<Foo>getFooLikeStructure()).foo)

// good
console.log((getFooLikeStructure() as Foo).foo)
```

## unknown vs any

`optional`

any를 사용하면 typescript를 사용하는 의미가 없어지기 때문에, any보다는 unknown을 사용한다.

```ts
// bad
let variable: any

// good
let variable: unknown
```

타입 체크 Util 함수에 Type Guard를 정의하고 unknown 타입에 적극 활용한다.

```ts
export const isString = (v: unknown): v is string => {
  return typeof v === 'string'
}
```

```ts
import { ObjectUtility } from '@utils'

let variable: unknown

if (ObjectUtility.isString(variable)) {
  variable.toUpperCase()
}
```

## Forbidden Types

`mandatory`

다음 type들은 사용하지 않는다. (non-primitive 타입)

```
[ Forbidden Types ]
Boolean
Number
String
Symbol
Object
Function
```

대신에 다음의 type들을 사용한다.

```
boolean
number
string
symbol
object
(arg1: string) => boolean
```

## Utility Types

`optional`

Utility Types은 적극적으로 활용하여 공통 타입을 변환하여 사용하고, 비슷한 타입을 다시 정의하는 것을 지양한다.

- Utility Types
  - [Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)
  - [Required](https://www.typescriptlang.org/docs/handbook/utility-types.html#requiredtype)
  - [Pick](https://www.typescriptlang.org/docs/handbook/utility-types.html#picktype-keys)
  - [Omit](https://www.typescriptlang.org/docs/handbook/utility-types.html#omittype-keys)
  - [Exclude](https://www.typescriptlang.org/docs/handbook/utility-types.html#excludetype-excludedunion)
  - [Extract](https://www.typescriptlang.org/docs/handbook/utility-types.html#extracttype-union)

```ts
// bad
interface Todo {
  title: string
  description: string
  completed: boolean
  createdAt: number
}

type TodoPreview = {
  title: string
  completed: boolean
  createdAt: number
}

const todo: TodoPreview = {
  title: 'Clean room',
  completed: false,
  createdAt: 1615544252770,
}
```

```ts
// good
interface Todo {
  title: string
  description: string
  completed: boolean
  createdAt: number
}

type TodoPreview = Omit<ITodo, 'description'>

const todo: TodoPreview = {
  title: 'Clean room',
  completed: false,
  createdAt: 1615544252770,
}
```
