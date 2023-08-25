---
title: (번역)왜 타입스크립트는 Object.keys의 타입을 적절하게 추론하지 못할까?
date: '2023-08-25'
tags: ['typescript', 'frontend']
draft: false
summary: '이는 구조적 타입 시스템에서 의도된 동작입니다. 타입 A가 B의 슈퍼셋인 경우(A는 B의 모든 프로퍼티를 포함) 타입 A를 B에 할당할 수 있습니다.'
---

> 원문: https://alexharri.com/blog/typescript-structural-typing

어느 정도 타입스크립트를 사용한 적이 있다면 이 문제를 겪어본 적이 있을 것입니다.

<img src="/static/images/ts-object-error.png" />

options 키를 사용하여 options에 접근하려고 하는데, 왜 타입스크립트는 이를 자동으로 알아채지 못할까요?

`Object.keys(options)`를 `(keyof typeof options)[]`로 캐스팅하면 이 문제를 비교적 쉽게 우회할 수 있습니다.

```typescript
const keys = Object.keys(options) as (keyof typeof options)[];
keys.forEach((key) => {
  if (options[key] == null) {
    throw new Error(`Missing option ${key}`);
  }
});
```

그런데 왜 처음부터 이게 문제가 되는 걸까요?

Object.keys의 타입 정의를 살펴보면 다음과 같은 내용을 확인할 수 있습니다.

```typescript
// typescript/lib/lib.es5.d.ts

interface Object {
  keys(o: object): string[];
}
```

타입 정의는 매우 간단합니다. 매개변수가 `object`이고 `string[]`을 반환하는 함수입니다.

이 메서드가 제네릭 매개변수 `T`를 받아들이고 `(keyof T)[]`를 반환하도록 만드는 것은 매우 간단합니다.

```typescript
class Object {
  keys<T extends object>(o: T): (keyof T)[];
}
```

`Object.keys`가 이렇게 정의되었다면 타입 에러가 발생하지 않았을 것입니다.

`Object.keys`를 이렇게 정의하는 것은 당연한 것처럼 보이지만 타입스크립트에서 그렇게 하지 않은 데에는 그럴 만한 이유가 있습니다. 그 이유는 타입스크립트의 [구조적 타입 시스템](https://en.wikipedia.org/wiki/Structural_type_system)과 관련이 있습니다.

<br />

### 타입스크립트의 구조적 타이핑

타입스크립트는 프로퍼티가 누락되었거나 잘못된 타입일 때 에러를 표시합니다.

<img src="/static/images/type-property-error.png" />

**그러나 타입스크립트는 추가 프로퍼티가 포함되어 있어도 에러를 표시하지 않습니다.**

```typescript
function saveUser(user: { name: string; age: number }) {}

const user = { name: 'Alex', age: 25, city: 'Reykjavík' };
saveUser(user); // 타입 에러가 아님
```

**이는 구조적 타입 시스템에서 의도된 동작입니다. 타입 A가 B의 슈퍼셋인 경우(A는 B의 모든 프로퍼티를 포함) 타입 A를 B에 할당할 수 있습니다.**

그러나 A가 B의 적절한 슈퍼셋인 경우(즉, A가 B보다 더 많은 프로퍼티를 가지고 있는 경우), 다음과 같습니다.

* A는 B에 할당 가능하지만
* B는 A에 할당할 수 없습니다.

구체적인 예를 살펴보겠습니다.

<img src="/static/images/type-property-error2.png" />

A 타입은 B의 슈퍼셋이므로 B에 할당할 수 있지만 B는 A에 할당할 수 없습니다.

<br />

### Object.keys의 안전하지 않은 사용

새로운 사용자를 생성하는 웹 서비스의 엔드포인트를 만든다고 가정해 봅시다. 다음과 같은 기존 User 인터페이스가 있습니다.

```typescript
interface User {
  name: string;
  password: string;
}
```

사용자를 데이터베이스에 저장하기 전에 User 객체가 유효한지 확인해야 합니다.

* name은 비어 있지 않아야 합니다.
* password는 6자 이상이어야 합니다.

따라서 `User`의 각 프로퍼티에 대한 유효성 검사 함수가 포함된 `validators` 객체를 만듭니다.

```typescript
const validators = {
  name: (name: string) => (name.length < 1 ? 'Name must not be empty' : ''),
  password: (password: string) =>
    password.length < 6 ? 'Password must be at least 6 characters' : '',
};
```

그런 다음 유효성 검사기를 통해 `User` 객체 검사를 실행하는 `validateUser` 함수를 만듭니다.

`user`에 있는 각 프로퍼티의 유효성을 검사하고 싶으므로 `Object.keys`를 사용하여 `user`에 있는 프로퍼티를 순회하면서 값을 가져올 수 있습니다.

```typescript
// 참고: 이 코드 블록에는 현재 숨기고 있는 타입 에러가 있습니다. 이 에러는 나중에 해결하겠습니다.

function validateUser(user: User) {
  let error = '';
  for (const key of Object.keys(user)) {
    const validate = validators[key];
    error ||= validate(user[key]);
  }
  return error;
}
```

**이 접근 방식의 문제점은 `user` 객체에 `validators`에 존재하지 않는 프로퍼티가 포함될 수 있다는 것입니다.**

```typescript
interface User {
  name: string;
  password: string;
}

function validateUser(user: User) {}

const user = {
  name: 'Alex',
  password: '1234',
  email: 'alex@example.com',
};
validateUser(user); // OK!
```

`User` 타입에 `email` 프로퍼티를 지정하지 않더라도 구조적 타이핑을 통해 불필요한 프로퍼티를 제공할 수 있으므로 여기서 타입 에러가 발생하지 않습니다.

그러면 런타임에 `email` 프로퍼티로 인해 `validator`가 `undefined`가 될 것이고 호출될 때 오류가 발생하게 됩니다.

<img src="/static/images/type-property-error3.png" />

다행히도 이 코드가 실행되기 전에 타입스크립트에서 타입 에러가 발생했습니다.

<img src="/static/images/type-property-error4.png" />

이제 `Object.keys`가 현재의 타입으로 정의된 이유에 대한 답을 얻었습니다. 타입 시스템이 인식하지 못하는 프로퍼티를 객체에 포함할 수 있다는 점을 받아들여야 합니다.

그러면 구조적 타이핑과 그 함정에 대해 새롭게 알게 된 지식을 바탕으로 구조적 타이핑을 효과적으로 사용할 수 있는 방법을 살펴봅시다.

<br />

### 구조적 타이핑 활용하기

구조적 타이핑은 많은 유연성을 제공합니다. 인터페이스가 필요한 프로퍼티를 정확하게 선언할 수 있습니다. 예제를 통해 이를 보여드리겠습니다.

`KeyboardEvent`를 파싱하고 트리거할 단축키를 반환하는 함수를 작성했다고 가정해 보겠습니다.

```typescript
function getKeyboardShortcut(e: KeyboardEvent) {
  if (e.key === 's' && e.metaKey) {
    return 'save';
  }
  if (e.key === 'o' && e.metaKey) {
    return 'open';
  }
  return null;
}
```

코드가 예상대로 작동하는지 확인하기 위해 몇 가지 단위 테스트를 작성해보겠습니다.

```typescript
expect(getKeyboardShortcut({ key: 's', metaKey: true })).toEqual('save');

expect(getKeyboardShortcut({ key: 'o', metaKey: true })).toEqual('open');

expect(getKeyboardShortcut({ key: 's', metaKey: false })).toEqual(null);
```

괜찮아 보이지만 타입 에러가 발생합니다.

<img src="/static/images/type-property-error5.png" />

37개의 추가 프로퍼티를 모두 지정하는 것은 매우 번거롭기 때문에 불가능합니다.

`KeyboardEvent`에 인수를 캐스팅하면 이 문제를 해결할 수 있습니다.

```typescript
getKeyboardShortcut({ key: 's', metaKey: true } as KeyboardEvent);
```

그러나 이 경우 발생할 수 있는 다른 타입 에러가 가려질 수 있습니다.

대신 이벤트에서 필요한 프로퍼티만 선언하도록 `getKeyboardShortcut`을 업데이트할 수 있습니다.

```typescript
interface KeyboardShortcutEvent {
  key: string;
  metaKey: boolean;
}

function getKeyboardShortcut(e: KeyboardShortcutEvent) {}
```

이제 테스트 코드는 이 최소한의 인터페이스만 충족하면 되므로 에러가 발생하지 않습니다.

또한 함수가 글로벌 `KeyboardEvent` 타입에 덜 종속되어 더 많은 컨텍스트에서 사용할 수 있습니다. 이제 훨씬 더 유연해졌습니다.

**이는 구조적 타이핑 덕분에 가능합니다. `KeyboardEvent`에 37개의 관련 없는 프로퍼티가 있더라도 `KeyboardEvent`는 슈퍼셋이기 때문에 `KeyboardShortcutEvent`에 할당할 수 있습니다.**

```typescript
window.addEventListener('keydown', (e: KeyboardEvent) => {
  const shortcut = getKeyboardShortcut(e); // 정상입니다!
  if (shortcut) {
    execShortcut(shortcut);
  }
});
```

이 아이디어는 Evan Martin의 글인 [인터페이스는 일반적으로 사용자에게 속합니다](https://neugierig.org/software/blog/2019/11/interface-pattern.html)에서 살펴볼 수 있습니다. <br />
꼭 읽어보시기를 강력히 추천합니다! 이 글은 제가 타입스크립트 코드를 작성하고 생각하는 방식을 바꾸어 놓았습니다.

이 게시물은 [해커 뉴스에서 많은 흥미로운 토론](https://news.ycombinator.com/item?id=36457557)을 불러 일으켰습니다. 이 게시물이 흥미로웠다면 한 번 읽어보시길 추천합니다.

---

### 참조

- https://alexharri.com/blog/typescript-structural-typing
- https://neugierig.org/software/blog/2019/11/interface-pattern.html
- https://news.ycombinator.com/item?id=36457557
