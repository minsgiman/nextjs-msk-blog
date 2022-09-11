---
title: Conditional Type과 infer
date: '2022-09-11'
tags: ['typescript']
draft: false
summary: 'infer는 타입 변수를 선언하면서 패턴 매칭되는(추론된) 타입을 저장한다.'
---

### Conditional Type과 infer

아래에서 다음과 같은 타입을 얻으려면 어떻게 해야 할까?

- T0 array type에서 엘리먼트의 타입
- T1 function type에서 리턴 타입

```ts
type T0 = string[];
type T1 = () => string;
```

방법은 Typescript의 [conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)와 [infer](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types)를 사용해서 type 패턴 매칭을 하여 얻을 수 있다.

#### infer 사용방법

다음의 예제를 살펴본다. <br />
infer는 타입 변수를 선언하면서 패턴 매칭되는(추론된) 타입을 저장한다. <br />

```ts
type UnpackedArray<T> = T extends (infer U)[] ? U : T;
type U0 = UnpackedArray<T0>; // string
```

**infer는 conditional type sytax의 extends 바로 오른쪽 위치에서만 사용할 수 있다.** <br />
**그리고 infer로 선언된 type변수는 conditional type의 true branch에서만 사용 가능하다.**

아래에서 발생하는 에러는 infer를 잘못된 위치에서 사용하였기 때문이다.

```ts
type Wrong1<T extends (infer U)[]> = T[0]; // Error
type Wrong2<T> = (infer U)[] extends T ? U : T; // Error
type Wrong3<T> = T extends (infer U)[] ? T : U; // Error
```

<img src="/static/images/infer-use.jpeg" width="450" />

이제 위에서 보았던 다음 문제를 풀어볼 수 있다.

- T1 function type에서 리턴 타입

```ts
type UnpackedFn<T> = T extends (...args: any[]) => infer U ? U : T;

type U1 = UnpackedFn<T1>; // string
```

infer는 또한 object의 key type을 추론하는데도 사용될 수 있다. <br />

```ts
type User = {
  id: number;
  name: string;
};

type PropertyType<T> = T extends { id: infer U; name: infer R } ? [U, R] : T;
type U3 = PropertyType<User>; // [number, string]
```

---

### 참조

- [Using TypeScript infer Like a Pro](https://levelup.gitconnected.com/using-typescript-infer-like-a-pro-f30ab8ab41c7)
