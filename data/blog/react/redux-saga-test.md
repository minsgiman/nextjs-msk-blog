---
title: Redux Saga 테스트하기
date: '2022-07-09'
tags: ['redux-saga', 'test']
draft: false
summary: 'redux-saga-test-plan은 사가(Saga) 제너레이터 함수를 테스트할 때, 실제 구현 로직과 테스트 코드가 갖는 커플링, 그리고 매뉴얼 한 테스트에 대한 문제를 해결해준다.'
---

## 목적

redux saga 테스트는 api를 mocking하여 성공, 실패등의 케이스에 따라 saga effect 가 적절하게 동작하는지 테스트한다.

## 테스트 구현

### [redux-saga-test-plan](https://github.com/jfairbank/redux-saga-test-plan) Library를 사용한다.

- 구현로직과 테스트코드가 갖는 커플링을 해결해준다.
- 여러 레이어로 구성된 saga, generator도 테스트시 모두 실행시켜 주기 때문에 쉽게 테스트할 수 있다.
- 체이닝 API를 제공하여 테스트 코드를 선언적으로 깔끔하게 작성가능하다.
- 실행순서와 상관없이 원하는 effect만을 쉽게 테스트할 수 있다.
- effect mocking을 지원한다. (provide)
- 자세한 사용방법은 [공식문서](http://redux-saga-test-plan.jeremyfairbank.com/) 를 참고한다.

redux-saga-test-plan은 사가(Saga) 제너레이터 함수를 테스트할 때, 실제 구현 로직과 테스트 코드가 갖는 커플링, 그리고 매뉴얼 한 테스트에 대한 문제를 해결해준다. <br />
그리고 redux-saga-test-plan은 redux-saga의 런타임을 함께 사용하므로, 통합 테스트를 할 수도 있고, redux-saga-test-plan에 내장된 이펙트 목킹(mocking)을 활용해 유닛 테스트도 작성할 수 있다.

### saga effect mocking & assert

- saga 의 각 제너레이터 함수들 로직을 테스트한다.
- provide를 통해 API 호출 effect 들을 모킹한다.
  - 동작방식은 provide 로 전달한 것과 일치하는 effect가 있는지 redux-saga-test-plan이 확인하여 일치한다면 saga에 effect 처리를 넘기지 않고 중간에 가로채어 바로 설정한 가짜 값을 반환한다.
- 아래 예제에서는 put effect들이 적절하게 호출되었는지 테스트하였다.

```ts
import { call } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import { throwError } from 'redux-saga-test-plan/providers';

import { CustomerAPI } from '@api';
import { customerMock } from '@mock';
import { CustomerActionType } from '@actions';
import { fetchProfile, requestRecognition } from './CustomerSaga';
import { requestDetection } from './SecuritySaga';

const { profile: customerProfileMock } = customerMock;

describe('CustomerSaga', function () {
  it('requestRecognition success', () => {
    const apiRes = {
      token: 'token',
    };
    const detectRes = {
      key: 'key',
      image: 'image',
    };

    return expectSaga(requestRecognition, { // requestRecognition 제너레이터 테스트 진행
      payload: {},
    })
      .provide([  // 모킹할 call effect들을 선언
        [call(requestDetection), detectRes],
        [call(CustomerAPI.requestRecognition), apiRes],
      ])
      .put({   // assert put effect
        type: CustomerActionType.REQUEST_RECOGNITION.SUCCESS,
        payload: apiRes,
      })
      .run();
  });
```

### payload onSuccess 모킹함수 실행 테스트

- 아래 예제에서는 전달한 onSuccess 모킹 함수가 적절하게 호출되었는지 또한 테스트한다.

```ts
it('fetchProfile success', () => {
  const successMock = jest.fn();

  return expectSaga(fetchProfile, {
    payload: { onSuccess: successMock, filter: 'NEW' },
  })
    .provide([
      [
        call(CustomerAPI.fetchProfile, {
          filter: 'NEW',
        }),
        customerMock,
      ],
    ])
    .put({
      type: CustomerActionType.FETCH_PROFILE.SUCCESS,
      payload: customerMock,
    })
    .run()
    .then(() => {
      expect(successMock).toBeCalledWith(customerMock); // assert onSuccess mock function called
    });
});
```

### effect error 테스트 및 effect 부분, 부정 assert

- [Partial Matching Assertions](https://redux-saga-test-plan.jeremyfairbank.com/integration-testing/partial-matching.html) 를 통해 effect의 부분만을 테스트할 수 있다. 예를들어 type만 체크하고 payload는 체크안할 수 있다.
  - 아래 예제에서 call.fn 을 통해 호출함수만 체크하고 payload는 체크하지 않는다.
- [Negated Assertions](https://redux-saga-test-plan.jeremyfairbank.com/integration-testing/negated-assertions.html) 를 통해 saga가 특정 effect를 yield 하지 않았는지 테스트한다.
  - 아래에서 .not.call.fn을 사용하고 있다.
- [Throw error](http://redux-saga-test-plan.jeremyfairbank.com/integration-testing/mocking/static-providers.html) 를 통해 throw error 를 시뮬레이트 할 수 있다.
  - 아래에서 throwError(error) 를 사용하고 있다.

```ts
import { call, select } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import { throwError } from 'redux-saga-test-plan/providers';

import { fetchPopups } from './PopupSaga';
import { PopupAPI } from '@api';
import { isLoginSelector } from '@selector';
import { ErrorHandler } from '@error';

describe('PopupSaga', function () {
  it('fetchPopups failed by not login status', () => {
    const onErrorMock = jest.fn();
    const error = new Error('Whoops');
    const fetchPopupPayload = { target: 'ACCOUNT' };

    return expectSaga(fetchPopups, {
      payload: {
        ...fetchPopupPayload,
        onError: onErrorMock,
      },
    })
      .provide([
        [select(isLoginSelector), false], // select effect 모킹. false를 반환한다.
        [call(PopupAPI.fetchPopups, fetchPopupPayload), throwError(error)], // PopupAPI.fetchPopups 호출시 throw error 모킹
      ])
      .call(PopupAPI.fetchPopups, fetchPopupPayload) // 실제 실행되는 순서대로 assert 선언을 할 필요는 없다.
      .call(ErrorHandler.showTerminationErrorPopup)
      .not.call.fn(PopupAPI.fetchPopups)
      .not.call.fn(ErrorHandler.showTemporaryErrorPopup)
      .run()
      .then(() => {
        expect(onErrorMock).toBeCalledWith(error);
      });
  });

  it('fetchPopups failed by login status', () => {
    const onErrorMock = jest.fn();
    const error = new Error('Whoops');
    const fetchPopupPayload = { target: 'MAIN' };

    return expectSaga(fetchPopups, {
      type: '',
      payload: {
        ...fetchPopupPayload,
        onError: onErrorMock,
      },
    })
      .provide([
        [select(isLoginSelector), true],
        [call(PopupAPI.fetchPopups, fetchPopupPayload), throwError(error)],
      ])
      .call.fn(PopupAPI.fetchPopups)
      .call.fn(ErrorHandler.showTemporaryErrorPopup)
      .not.call.fn(PopupAPI.fetchPopups)
      .not.call.fn(ErrorHandler.showTerminationErrorPopup)
      .run()
      .then(() => {
        expect(onErrorMock).toBeCalledWith(error);
      });
  });
});
```

### reducer와 통합 테스트

saga에서 발생시키는 effect에 따라 reducer 상태가 적절하게 변경되었는지 통합 테스트를 작성할 수 있다.

```js
const INITIAL_STATE = { users: [] };

function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case 'FETCH_USERS_SUCCESS':
      return { ...state, users: action.payload };
    default:
      return state;
  }
}
```

```js
import { expectSaga } from 'redux-saga-test-plan';

it('fetches the users into the store state', () => {
  const users = ['Jeremy', 'Tucker'];

  return expectSaga(fetchUsersSaga)
    .withReducer(reducer)
    .provide([[call(api.getUsers), users]])
    .hasFinalState({ users })
    .run();
});
```

### 테스트 진행시 trouble shooting

jest.useFakeTimers('modern') 와 함께 redux-saga-test-plan(4.0.5 version) 의 expectSaga를 사용하면 expectSaga가 내부에서 제너레이터를 단계별로 실행 못시키고 멈춰있는 이슈가 있다.

---

### 참조

- [redux-saga-test-plan - 간편한 Redux Saga 테스트](https://ui.toast.com/weekly-pick/ko_20180514)
- [Testing Sagas](https://redux-saga.js.org/docs/advanced/Testing/)
