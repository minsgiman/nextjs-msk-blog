---
title: cypress E2E 테스트
date: '2020-09-15'
tags: ['cypress', 'test', 'frontend']
draft: false
summary: 'Cypress는 E2E 테스트 framework으로 Chai assertion library를 내장하고 있고, stubbing 기능을 제공한다.'
---

# Cypress는?

Cypress는 E2E 테스트 framework으로 [Chai assertion library](https://docs.cypress.io/guides/references/assertions)를 내장하고 있고, [stubbing](https://docs.cypress.io/guides/guides/stubs-spies-and-clocks) 기능을 제공한다.

[Cypress Guides](https://docs.cypress.io/guides/overview/why-cypress)

#### E2E 테스트는 다음의 4단계로 진행된다. cypress는 이에대한 직관적인 API를 제공한다.

- visit (테스트하려는 url로 이동)
- get element (element요소 선택)
- action (click, scroll, input)
- assertion

[Cypress Commands 참고](https://docs.cypress.io/api/table-of-contents)

또한 [Cypress Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)를 통해 cypress custom command를 만들 수 있다.

#### Cypress 테스트 Commands가 DOM update 전에 실행된다면?

예를 들어 cypress element get을 호출한다면 해당 DOM element를 찾을 때 까지 cypress는 주기적으로 retry를 해주어서, 개발자가 로딩을 기다리는 불필요한 wait문을 추가하지 않아도 된다.

#### click과 같은 DOM과 상호작용하는 cypress command 실행시

다음과 같이 해당 엘리먼트가 user가 클릭할 수 있는 상태인지도 같이 검증해준다. (Act like a human user - can a user click on the element?)

- is the element visible? (클릭 대상이 화면에 보이는 상태인지?)
- is the element behind another element? (다른 엘리먼트에 가려지지 않았는지?)
- does the element have the disabled attribute? (disable된 상태는 아닌지?)

이처럼 내부적으로 실제 user가 커맨드를 실행하는데 문제가 없는지 검증해줌으로써 테스트코드 작성에 대한 부담을 줄여주고, 테스트코드에 assertion을 넣지 않아도 app 동작을 확인하는 과정만으로도 의미있는 E2E 테스트가 되기도 한다.

#### network stub기능

네트워크 요청을 인터셉트해서 원하는 response로 받을 수 있다. 서버에 디펜던시 없이 테스트가 가능하다.

stub한 네트워크 요청 응답속도는 빠르기 때문에 테스트를 빠르게 수행할 수 있는 장점 또한 있다.

[network stub을 위한 intercept API](https://docs.cypress.io/api/commands/intercept)

<br />

# Cypress test 작성 가이드

### 테스트 구성요소

- 페이지 로드 후 초기 api 호출 여부
- 페이지의 비즈니스 로직 테스트
  - input 값 입력, 버튼 클릭 등, api 응답에 따른 동작 등 각 페이지의 기능을 테스트한다.
  - api 호출시 request body data 검증, 팝업 노출 여부 , 페이지 이동 발생시 path 확인 등..
  - 기본적인 테스트 코드 작성 방법은 [cypress 공식 가이드](https://docs.cypress.io/guides/getting-started/writing-your-first-test#Add-a-test-file)를 참고한다.

### Coding Convention

cypress 공식 홈페이지 [Best Practice](https://docs.cypress.io/guides/references/best-practices#Selecting-Elements) 참고

#### 1) Selector 구성 방법

- 테스트에 사용될 element selector 사용시, `data-testid` attribute 를 추가하여 selector를 사용한다.
  - selector 에서 element type, class명 등을 포함하면 테스트할 element 의 수정에 취약하기 때문에 가능하면 `data-testid` attribute를 추가하여 테스트한다.

```html
<button id="main" class="btn btn-large" name="submission" role="button" data-testid="button-submit">
  Submit
</button>
```

- 아래 두개 형태로만 selector를 구성하여 사용한다

| Selector                                      | Recommended | Notes                                                           |
| --------------------------------------------- | ----------- | --------------------------------------------------------------- |
| cy.get('button').click()                      | Never       | Worst - too generic, no context.                                |
| cy.get('.btn.btn-large').click()              | Never       | Bad. Coupled to styling. Highly subject to change.              |
| cy.get('#main').click()                       | Sparingly   | Better. But still coupled to styling or JS event listeners.     |
| cy.get('[name=submission]').click()           | Sparingly   | Coupled to the name attribute which has HTML semantics.         |
| cy.contains('Submit').click()                 | Depends     | Much better. But still coupled to text content that may change. |
| cy.get('[data-testid=button-submit]').click() | Alway       | Best. Isolated from all changes.                                |

- selector를 위한 `data-testid` attribute 설정법
  - `{element}-{optional 구분자}-{index or id}` 형식으로 설정
  - 해당 attribute는 cypress를 포함한 모든 테스트에서 사용 가능하다

<br />

#### 2) 자주 이용되는 기능은 [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands#Syntax)에 추가하여 사용한다.

- import 문 사용을 줄일 수 있다.
- [custom commands 에 타입 추가](https://docs.cypress.io/guides/tooling/typescript-support#Types-for-custom-commands) 시 IDE 자동완성 기능 사용 가능하다.

<br />

#### 3) cypress command는 불필요한 wait 문 없이도 테스트 코드를 작성 할 수 있도록 구성되어 있기 때문에 불필요한 wait문 사용을 지양한다.

- `cy.visit()`: 페이지의 load 이벤트가 발생할 때 까지 자동으로 wait
- `cy.get()`: element 를 선택할 수 있을 때까지 자동으로 wait
- 자동으로 동작하는 wait 기능의 default 옵션에 수정이 필요한 경우 개별적으로도 수정 가능

<br />

#### 4) 이전 테스트가 완료된 상태를 이용한 테스트는 지양한다.

- 아래처럼 이전 테스트가 끝난 상태를 활용한 테스트를 작성한 경우 테스트간 종속성 발생하여 실패한경우 어떤 테스트가 원인이 되는지 알기 어려움

```js
// an example of what NOT TO DO
describe('my form', () => {
  it('visits the form', () => {
    cy.visit('/users/new')
  })

  it('requires first name', () => {
    cy.get('#first').type('Johnny')
  })

  it('requires last name', () => {
    cy.get('#last').type('Appleseed')
  })

  it('can submit a valid form', () => {
    cy.get('form').submit()
  })
})
```

- 불필요하게 나눠져 있는 테스트는 하나의 테스트 문으로 합친다
  - cypress는 각 테스트를 위한 리셋 과정의 비용이 크다.
  - 테스트를 합치더라도 테스트가 실패한 경우 어떤 assertion에서 실패했는지 항상 확인 가능하다

```js
describe('my form', () => {
  it('can submit a valid form', () => {
    cy.visit('/users/new')

    cy.log('filling out first name') // if you really need this
    cy.get('#first').type('Johnny')

    cy.log('filling out last name') // if you really need this
    cy.get('#last').type('Appleseed')

    cy.log('submitting form') // if you really need this
    cy.get('form').submit()
  })
})
```

- 테스트 앞단계에서 공유되는 코드는 before, beforeEach 문으로 이동
  - 테스트가 끝나고 수동으로 애플리케이션을 동작시킬 수 있는 dangling 상태를 활용하기 위해 after, afterEach 에서의 초기화는 지양한다.

```js
describe('my form', () => {
  beforeEach(() => {
    cy.visit('/users/new')
    cy.get('#first').type('Johnny')
    cy.get('#last').type('Appleseed')
  })

  it('displays form validation', () => {
    cy.get('#first').clear() // clear out first name
    cy.get('form').submit()
    cy.get('#errors').should('contain', 'First name is required')
  })

  it('can submit a valid form', () => {
    cy.get('form').submit()
  })
})
```

<br />

#### 5) API 모킹시 미리 정의한 custom command인 `cy.interceptApi` 를 사용한다

```ts
// define
type IinterceptDefaultApi<T> = {
  pathname: string | RegExp
  alias: string
  query?: Record<string, string | RegExp>
  method?: Imethod
  content?: T
  argument?: Record<string, unknown>
  setContent?: (url: string) => T
  code?: number
  delay?: number
  retryCnt?: number
  status?: number
  routeHandler?: (req: CyHttpMessages.IncomingHttpRequest) => T | void
}

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * to manage the behavior of HTTP requests at the network layer.
       * - https://docs.cypress.io/api/commands/intercept
       * @example
       * cy.interceptApi(options)
       */
      interceptApi<T>(options: IinterceptDefaultApi<T>): Chainable<null>
    }
  }
}

Cypress.Commands.add(
  'interceptApi',
  <T>({
    pathname,
    alias,
    query,
    method = 'GET',
    content,
    argument,
    setContent,
    code = 0,
    delay = 1000 * 0.05,
    retryCnt = 1,
    status,
    routeHandler,
  }: IinterceptDefaultApi<T>) => {
    let cnt = 0

    return cy
      .intercept(
        {
          method,
          pathname,
          query,
        },
        (req: CyHttpMessages.IncomingHttpRequest) => {
          const body = routeHandler?.(req)

          const errorCode = code === 0 ? code : cnt > retryCnt ? 0 : code

          const contentData =
            errorCode === 0
              ? body
                ? body
                : typeof setContent === 'function'
                ? setContent(req.url)
                : content
              : content

          // console.log(
          //   '#### check - interceptApi',
          //   { method, pathname, cnt, statusCode, body, routeHandler },
          //   contentData
          // );

          req.reply({
            statusCode: status ? status : errorCode === 0 ? 200 : 500,
            body: {
              code: errorCode,
              content: contentData,
              argument,
              message: 'ok',
            },
            delay,
          })

          cnt++
        }
      )
      .as(alias)
  }
)
```

```ts
//use
function interceptAmountApi({ balance = 3000, code = 0 } = {}) {
  cy.interceptApi({
    alias: 'fetchAmount',
    pathname: new RegExp(`test/.+/amount$`),
    content: {
      balance,
      minAmount: 1000,
      maxAmount: 20000,
    },
    code,
    routeHandler: (req) => {
      expect(req.body.secure).to.not.be.null
    },
  })
}
```
