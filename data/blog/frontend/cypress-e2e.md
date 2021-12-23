---
title: cypress E2E 테스트
date: '2020-09-15'
tags: ['cypress', 'test', 'frontend']
draft: false
summary: 'Cypress는 E2E 테스트 framework으로 Chai assertion library를 내장하고 있고, stubbing 기능을 제공한다.'
---

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
