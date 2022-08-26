---
title: cypress code coverage 측정
date: '2021-09-11'
tags: ['cypress', 'test', 'frontend']
draft: false
summary: 'cypress code coverage 측정이 어떻게 이루어지고, 이를 위한 설정 과정을 정리하였다.'
---

cypress code coverage 측정이 어떻게 이루어지고, 이를 위한 설정 과정을 정리하였다.

사용한 Library는 다음 버전을 기준으로 작성하였다.

```js
"babel-plugin-istanbul": "^6.0.0",
"@cypress/code-coverage": "^3.9.2",
"nyc": "^15.1.0",
"istanbul-lib-coverage": "^3.0.0",
```

## code coverage 측정은 왜 필요한가?

- App에서 어떤 부분이 테스트 되지 않았는지 파악할 수 있게 해준다.
- 특정 코드에 대한 테스트가 불필요하게 너무 많이 실행되지는 않았는지 파악할 수 있게 해준다.

## code coverage 측정 3 단계

code coverage 측정은 다음 3단계가 순서대로 진행된다.

- Instrument code
- Run tests
- Report results

### 1. Instrument code (Instrumentation)

Instrumentation은 테스트시 코드의 **어떤 부분이 실행되는지 추적하기 위한 코드를 original 코드에 심는 과정**이다. 다음 코드를 살펴보자.

```js
// add.js
function add(a, b) {
  return a + b;
}
module.exports = { add };
```

Instrumentation 과정에서는 위의 코드를 파싱하여 functions, statements, branches 를 찾는다. <br />
그리고 다음과 같이 **window.\_\_coverage\_\_** 를 주입하여 각 부분들이 테스트에서 몇 번 수행 되는지 카운팅한다.

```js
const c = (window.__coverage__ = {
  f: [0] /* 각 function 호출 횟수 카운팅 */,
  s: [0, 0, 0] /* 각 statement 호출 횟수 카운팅 */,
});

c.s[0]++;
function add(a, b) {
  c.f[0]++;
  c.s[1]++;

  return a + b;
}
c.s[2]++;
module.exports = { add };
```

#### Instrument code Library 적용 (with babel)

위에서 설명한 Instrumentation은 트랜스파일링 과정에서 진행되기 때문에 이를 위한 Library를 babel plugin에 등록해주어야 한다. <br />
Instrumentation 을 위한 Library는 [Istanbul.js](https://istanbul.js.org/) 을 사용하였다. <br />
[babel-plugin-istanbul](https://github.com/istanbuljs/babel-plugin-istanbul)을 설치하고, .babelrc에 다음과 같이 설정한다.

```cmd
npm i -D babel-plugin-istanbul
```

```js
"presets": [
  ...
],
"plugins": [
  ...
],
/* NODE_ENV=test 인 경우에만 Instrument code 를 수행한다. */
"env": {
  "test": {
    "plugins": ["istanbul"]
  }
}
```

이제 NODE_ENV=test 로 설정하고 빌드를 실행한다. <br />
그리고 실행된 App의 디버그 콘솔에서 **window.\_\_coverage\_\_** 를 확인해보자.

![object](/static/images/coverage1.png 'object')

**\_\_coverage\_\_**에는 각 모듈의 function, statement, branche 별 실행 횟수 정보가 있다. <br />

### 2. Run tests

이제 위에서 설정한 **window.\_\_coverage\_\_** 를 cypress 테스트와 동기화하고 그 결과를 우리가 보기 좋게 report를 만들어주어야 한다.

coverage를 cypress 테스트와 동기화하면 다음과 같이 진행할 것이다.

- cypress 테스트를 시작할 때 window.\_\_coverage\_\_를 초기화한다.
- cypress 테스트 완료시 측정된 coverage 결과를 저장하고, 이에 대한 Report를 생성한다.

이를 위해서는 다음 Library들이 필요하다.

```cmd
npm i -D @cypress/code-coverage nyc istanbul-lib-coverage
```

[nyc](https://www.npmjs.com/package/nyc)는 앞에서 설치한 Istanbul.js의 CLI이다. <br />
[@cypress/code-coverage](https://www.npmjs.com/package/@cypress/code-coverage/v/3.4.0)가 coverage를 초기화하고, report를 생성할 때 nyc를 사용한다. <br />
설치 후 다음과 같이 cypress에 @cypress/code-coverage를 연결해준다.

```js
//cypress/support/index.js
import '@cypress/code-coverage/support';
```

```js
//cypress/plugins/index.js
module.exports = (on, config) => {
  require('@cypress/code-coverage/task')(on, config);
  on('file:preprocessor', cypressTypeScriptPreprocessor);
  return config;
};
```

이제 cypress 테스트를 실행하면 다음 Task가 추가로 실행되는 것을 확인할 수 있다.

- BEFORE ALL -> Coverage Reset
- AFTER EACH -> Saving code coverage
- AFTER ALL -> Coverage Generating report

![object](/static/images/coverage2.png 'object')

<br />

### 3. Report results

테스트 후에 생성된 Coverage report는 default로 cypress와 같은 경로의 coverage directory에 생성되어 있을 것이다. <br />
생성되는 report 타입과 Directory를 변경하려면 [nyc configuration](https://www.npmjs.com/package/nyc#common-configuration-options)을 참고한다. <br />
(@cypress/code-coverage에서 nyc설정파일(.nycrc)을 process.cwd()에서 찾기 때문에 nyc설정파일은 cypress 폴더와 같은 위치에 있어야 한다.) <br />
이제 생성된 coverage/lcov-report/index.html 을 실행해본다. <br />
실행된 Statements, Branches, Functions, Lines 를 확인해볼 수 있다. <br />

![object](/static/images/coverage3.png 'object')

File - Directory명을 클릭해서 들어오면 각 파일에서 어떤 부분이 몇 번 실행되고, 실행되지 않았는지 볼 수 있다.

![object](/static/images/coverage4.png 'object')

---

### 참조

- [Cypress Code Coverage](https://docs.cypress.io/guides/tooling/code-coverage#Introduction)

- [Cypress code coverage for create-react-app v3](https://www.cypress.io/blog/2019/09/05/cypress-code-coverage-for-create-react-app-v3)
