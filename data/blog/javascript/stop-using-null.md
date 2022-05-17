---
title: stop using null
date: '2022-05-18'
tags: ['javascript']
draft: false,
summary: 'null과 undefined 둘 중 하나만 사용해야 한다. 그 중에 버려야 한다면 null을 버려야 한다. 왜냐하면 js엔진이 undefined를 사용하고 있기 때문이다.'
---

null과 undefined는 javascript에서 다른 의미를 가지고 있다. <br />
그런데 javascript에서 null은 사용하지 않고 undefined만을 사용하는 것을 권고하는 여러 내용들이 있어서 정리하였다.

### [Douglas Crockford - The Better Parts](https://www.youtube.com/watch?v=PSGEjv3Tqo0&t=561s)

> null과 undefined 둘 중 하나만 사용해야 한다. 그 중에 버려야 한다면 null을 버려야 한다. 왜냐하면 js엔진이 undefined를 사용하고 있기 때문이다. (초기값이 없다면 엔진에서 변수에 undefined를 할당)

> typeof 키워드를 사용하면 null의 타입을 object로 판별한다.

typeof 부분은 의도한 것이 아닌 자바스크립트의 오류이나 변경시 기존 사용중인 코드들에 미치는 영향이 크기 때문에 변경하기 쉽지 않을 것으로 보인다.

### [Eric Elliot - Handling null and undefined in JavaScript](https://medium.com/javascript-scene/handling-null-and-undefined-in-javascript-1500c65d51ae)

> null, undefined 두 개의 primitive value가 필요한 이유를 모르겠다.

> ES6에서 default parameter를 사용할 수 있게 되었는데 null에 대해서는 동작하지 않는다. 내 경험에 보통 이것은 의도치 않은 버그를 발생시킨다.

다음과 같이 null에 대해서는 default parameter가 동작하지 않는다.

```js
function sayHello(name = 'World') {
  console.log('Hello, ' + name + '!')
}

sayHello('Jim') // Hello, Jim!
sayHello(undefined) // Hello, World!
sayHello(null) // Hello, null!
```

### [Typescript Team - Coding-guidelines](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines#null-and-undefined)

> 코딩 가이드 - Use undefined. Do not use null.

typescript 팀 개발 가이드에서 위와 같은 룰을 정하였다. typescript 사용에 대한 가이드는 아님

### ESLint에서 제한하기

eslint에서 null 사용을 제한하려면 다음의 룰을 사용하면 된다. <br />
https://www.npmjs.com/package/eslint-plugin-no-null

### 정리

대부분 null과 undefined 둘 중 하나만 사용하자는 의견들이 많았다. (굳이 두개가 필요없고, 하나만 있으면 된다. 대부분의 다른 언어들에서도 하나만 있다.) <br />
그 중에 위 글 내용의 이유로 undefined를 선택하자는 의견들이었다. <br />
생각해보면 typescript에서도 null, undefined 혼용해서 쓰면 타입 각각 따로 정의 해줘야 하는 번거로움이 있었던 것 같다.

```ts
error?: Error | null    // error: Error | null | undefined
```
