---
title: barrel 파일을 통한 re-export와 performance
date: '2022-04-16'
tags: ['frontend', 'performance']
draft: false
summary: 'barrel 파일을 통해 외부에 공개할 기능을 관리하고 외부에서 깔끔하게 import 할 수 있다. 하지만 re-export가 때로는 성능 문제를 야기할 수 있다.'
---

barrel 파일은 여러 모듈을 묶어서 re-export 하고 다음과 같이 사용한다.

```js
export * from './Foo'
export * from './Far'
export * from './FooBar'
```

그러면 외부에서 barrel 파일을 통해 다음과 같이 import 할 수 있다.

```js
import { Foo, Bar, FooBar } from '@components'
```

barrel 파일을 통해 외부에 공개할 기능을 관리하고 외부에서 깔끔하게 import 할 수 있다. <br />
하지만 re-export가 때로는 성능 문제를 야기할 수 있다. <br />

### code-splitting 이슈와 불필요한 코드실행

다음과 같은 상황이 있다고 가정해보자

```js
// @components/index.js
export * from './Foo'
export * from './Bar'
export * from './FooBar'
```

```js
// MainPage.js
import { Foo } from '@components'

// ...
```

```js
// DynamicPage.js
import { Bar } from '@components'

// ...
```

```js
// @components/Bar.js
import QrCode from 'qrcode'

// ...
```

초기로딩시 사용하는 MainPage는 @components 에서 Foo 만을 사용한다. <br />
code-splitting 되어 dynamic import 할 DynamicPage는 @components 에서 Bar 만을 사용한다. <br />
그러면 초기로딩시 Bar 컴포넌트는 사용안하기 때문에 초기 로딩 번들에 포함되지 않았으면 좋겠지만 그렇지 않다.

Main에서 @components/index 로 import 하고 있기 때문에 @components/index 에 묶여 있는 컴포넌트들 전체가 초기 번들에 포함된다. (참고로 Bar는 다른 chunk에서 사용을 하기 때문에 tree-shaking의 대상이 되지 않는다.)

또한 Bar 에서는 qrcode 라이브러리를 import 하고 있다. <br />
qrcode는 초기로딩시 사용할 일이 없지만 단지 import 하는 것만으로 다음과 같은 일이 일어난다.

[초기로딩시 coverage 기록]
<img src="/static/images/coverage-qrcode.png" />

qrcode 내부에서 사용하는 여러 모듈들이 같이 포함되고, qrcode 내부의 어떤 function들은 초기화 과정에서 실행되고 있다. <br />
위와 같이 초기로딩시에 하지 않아도 될 작업들이 우리가 모르는 사이 생길 수 있다. <br />

### Bundle initialization 비용의 증가

dynamic import 를 사용하지 않아도 re-export 는 성능 문제를 야기한다. <br />
Bundle initialization 비용의 증가로 이어지는데 먼저 webpack bundle 빌드방식과 v8엔진의 lazy parsing에 대해 알아본다.

#### webpack bundle 빌드

webpack이 bundle을 빌드할때, 각 module을 함수로 wrap하고 ID를 부여한다. ID는 함수의 이름이 된다. <br />

```js
// Before
import formatDate from './formatDate.js';

// After
fOpr: function(module, __webpack_exports__, __webpack_require__)
{ |"use strict"| | __webpack_require__.r(__webpack_exports__); | | var
_formatDate__WEBPACK_IMPORTED_MODULE_0__ = |
__webpack_require__("xN6P"); | | // ... | }, |
```

\_\_webpack_require\_\_는 webpack의 internal함수로써 module을 require 하는데 사용된다. <br />
webpack은 import를 모두 \_\_webpack_require\_\_() 로 변환한다. <br />
Bundle initialization이 많은 시간이 걸리는 이유는 \_\_webpack_require\_\_(모듈함수ID) 가 모두 실행되기 때문이다. <br />
import하는 모듈이 많아질수록 그 비용은 올라간다.

#### v8 엔진 lazy parsing

v8 JS 엔진은 번들파일 전체를 fully하게 파싱하지 않는다. <br />
성능을 위해서 당장 사용하는 코드만 full-parsing 하고 나머지는 [pre-parsing](https://v8.dev/blog/preparser)만 수행한다. <br />
pre-parsing은 syntax error 정도만 먼저 체크하고, 추상 구문 트리(AST)를 만들지 않으며 변수의 scope를 확인하는 과정도 수행하지 않는다. <br />
따라서 pre-parsing은 full-parsing에 비해 훨씬 빠르고 메모리 사용을 아낄 수 있다.

그래서 barrel 파일을 통한 re-export는 수많은 불필요한 \_\_webpack_require\_\_ 수행과 JS엔진의 full-parsing 대상을 늘릴 수 있다. <br />

아래에서 utils/index 파일을 통해 묶여있는 많은 모듈들로 initialization 시간이 오래 걸리는 것을 볼 수 있다. <br />
실제로 프로젝트에서 utils/index 를 제거하고 모두 direct import 하도록 변경하였더니 초기로딩에서 300ms 정도 개선이 있었다.
<img src="/static/images/index-webpack-require.png" />

### 결론

모든 디렉토리마다 barrel 파일을 만들어서 re-export 하는 것은 의도치 않은 성능 문제를 일으킬 수 있기 때문에 지양해야 한다. <br />
barrel 파일로 묶는 모듈 개수가 너무 많으면서 각 모듈들이 실행되는 시점이 다르고 tree-shaking의 대상도 아니라면 re-export 하는 것 보다는 각 모듈을 direct import 하는 것이 성능상 이점이 있을 것으로 보인다.

---

### 참조

- [Okay, let’s talk about reexports – and why they’re bad for loading and runtime performance.](https://twitter.com/iamakulov/status/1331551351214645251)
- [Lazy JavaScript Parsing in V8](https://www.mattzeunert.com/2017/01/30/lazy-javascript-parsing-in-v8.html)
- [Notion은 app performance를 어떻게 향상시켰는가?](https://devjin-blog.com/notion-performance-enhancement/)
