---
title: Javascript decorator 사용하기
date: '2022-04-07'
tags: ['javascript']
draft: false,
summary: 'decorator는 자바스크립트 함수로 클래스 자체 또는 클래스의 field, method를 수정하는데 사용된다.'
---

Javascript class에서 사용 가능한 [decorator](https://github.com/tc39/proposal-decorators)가 [조건부로 stage3](https://github.com/tc39/proposal-decorators/pull/454)단계로 올라갔다고 한다. <br />
그래서 decorator를 직접 사용해보았다.

## decorator 구현

decorator는 자바스크립트 함수로 클래스 자체 또는 클래스의 field, method를 수정하는데 사용된다. <br />
자바스크립트 decorator 함수에는 다음의 세 가지 인자가 전달된다.

1. **target**은 현재 인스턴스 객체의 클래스이다.
2. **key**는 데코레이터를 적용할 속성 이름이다(문자열).
3. **descriptor**는 해당 속성 서술자 객체이다.

세 번째 인자 descriptor(속성 서술자)는 객체 property의 속성을 나타낸다. <br />
다음의 속성들이 있다.

- configurable
- enumerable
- value
- writable
- get
- set

descriptor에 관해서 다음의 설명을 참고한다.
https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#%EC%84%A4%EB%AA%85

#### Class field, method 장식하기

decorator로 class의 field, method를 꾸밀때 decorator는 새로운 descriptor를 반환해야 한다.
아래 예제에서는 다음 두 가지 데코레이터를 구현한다.

- 속성을 읽기 전용으로 만드는 데코레이터
- 로깅 기능을 추가한 데코레이터

```js
const readOnly = (target, key, descriptor) => {
  return {
    ...descriptor,
    writable: false,
  }
}

const logger = (msg) => (target, key, descriptor) => {
  const originMethod = descriptor.value

  descriptor.value = function (...args) {
    console.log('[LOG]', msg)
    return originMethod.apply(this, args)
  }

  return descriptor
}

class Rectangle {
  @readOnly
  size = 100

  constructor(color) {
    this.color = color
  }

  @logger('get rectangle info')
  getRectangleInfo() {
    return `${this.color} ${this.size}`
  }
}

const rectangle = new Rectangle('red')
console.log(rectangle.getRectangleInfo())
// [LOG] get rectangle info
// red 100
rectangle.size = 200
// TypeError: Cannot assign to read only property 'size' of object '#<Rectangle>'
```

아래 예제에서는 API 오류 처리 코드를 데코레이터로 정의하여 재사용한다.

```js
function apiRequest(target, key, descriptor) {
  const apiAction = async function (...args) {
    const original = descriptor.value || descriptor.initializer.call(this)

    this.setNetworkStatus('loading')

    try {
      const result = await original(...args)
      return result
    } catch (e) {
      this.setApiError(e)
    } finally {
      this.setNetworkStatus('idle')
    }
  }

  return {
    ...descriptor,
    value: apiAction,
    initializer: undefined,
  }
}

class WidgetStore {
  @apiRequest
  async getWidget(id) {
    const { widget } = await api.getWidget(id)
    this.addWidget(widget)
    return widget
  }

  setNetworkStatus(status) {
    //...
  }

  setApiError(error) {
    //...
  }
}
```

#### Class 자체 장식하기

속성과 메서드를 장식하는 대신 전체 클래스를 장식할 수도 있다. 그렇게 하려면 데코레이터 함수의 첫 번째 인자로 전달할 target만 있으면 된다.

```js
function withDob(target) {
  return class extends target {
    constructor(...args) {
      super(...args)
      this.dob = new Date().toString()
    }

    setDob(dob) {
      this.dob = dob
    }
  }
}

@withDob
class Person {
  constructor(firstName, lastName) {
    this.firstName = firstName
    this.lastName = lastName
  }
}

const p = new Person('last', 'first')
p.setDob(new Date('1990-02-05').toString())
console.log(p.dob)
// Mon Feb 05 1990 09:00:00 GMT+0900
```

## decorator 미리 사용하기

decorator는 현재 browser에서 지원하지 않아서 [@babel/plugin-proposal-decorators](https://www.npmjs.com/package/@babel/plugin-proposal-decorators) 플러그인을 설치해서 사용 가능하다.

설치하고 .babelrc에서 다음 설정을 추가한다.

```js
"plugins": [
    [
      "@babel/plugin-proposal-decorators",
      {
        "legacy": true
      }
    ]
],
```

---

### 참조

- [자바스크립트 데코레이터 이해하기](https://ui.toast.com/weekly-pick/ko_20200102)
- [JavaScript Decorator 이해하기](https://wonism.github.io/what-is-decorator/)
- [Javascript Weekly 583](https://javascriptweekly.com/issues/583)
