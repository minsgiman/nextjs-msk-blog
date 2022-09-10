---
title: Mapped Types
date: '2022-09-08'
tags: ['typescript']
draft: false
summary: 'Typescript의 Partial, Required, Readonly and Pick 유틸리티 타입은 내부적으로 어떻게 구현되어 있을까?'
---

### Mapped Types

Typescript의 Partial, Required, Readonly and Pick 유틸리티 타입은 내부적으로 어떻게 구현되어 있을까?

```ts
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

위와 같이 original object type을 new object type으로 매핑 시킬 수 있는 generic type을 mapped type이라고 부른다.

mapped type의 syntax는 다음과 같다.

<img src="/static/images/mapped-type.jpeg" width="500" />

mapping process에서 read-only, optional(?) modifier를 정의해줄 수 있고, plus(+)와 minus(-) prefix를 붙여서 modifier를 추가 제거한다. <br />
+, - prefix가 생략되면 default는 plus다.

```ts
{ [ P in K ] : T }
{ [ P in K ] ?: T }
{ [ P in K ] -?: T }
{ readonly [ P in K ] : T }
{ readonly [ P in K ] ?: T }
{ -readonly [ P in K ] ?: T }
```

다음의 mapped type 예제를 참고한다.

```ts
type Item = { a: string; b: number; c: boolean };

type T1 = {
  [P in 'x' | 'y']: number;
};
// { x: number, y: number }

type T2 = {
  [P in 'x' | 'y']: P;
};
// { x: 'x', y: 'y' }

type T3 = {
  [P in 'a' | 'b']: Item[P];
};
// { a: string, b: number }

type T4 = {
  [P in keyof Item]: Item[P];
};
// { a: string, b: number, c: boolean }
```

<br />

### Mapped Types의 key 변경하기

[Typescript 4.1 부터 as 를 사용하여 mapped type의 key를 변경 할 수 있는 방법을 제공한다.](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as)

아래 예제에서 Capitalize는 첫 번째 글자를 대문자로 변경한다. <br />
\<string & K\> 에서 앞의 string의 의미는 non-string type의 key를 필터링해주기 위함이다.

```ts
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
interface Person {
  name: string;
  age: number;
  location: string;
}
type LazyPerson = Getters<Person>;
// {
//   getName: () => string;
//   getAge: () => number;
//   getLocation: () => string;
// }
```

아래 예제에서는 kind property를 제거한다.

```ts
// Remove the 'kind' property
type RemoveKindField<T> = {
  [K in keyof T as Exclude<K, 'kind'>]: T[K];
};
interface Circle {
  kind: 'circle';
  radius: number;
}
type KindlessCircle = RemoveKindField<Circle>;
//   type KindlessCircle = {
//       radius: number;
//   };
```

---

### 참조

- [Using TypeScript Mapped Types Like a Pro](https://javascript.plainenglish.io/using-typescript-mapped-types-like-a-pro-be10aef5511a)
