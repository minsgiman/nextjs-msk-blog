---
title: Reducer 테스트하기
date: '2020-09-20'
tags: ['reducer', 'test']
draft: false
summary: '유닛 테스트를 통해 reducer의 순수함수 로직들을 테스트한다.'
---

유닛 테스트를 통해 reducer의 순수함수 로직들을 테스트한다.

reducer에 현재상태 + action(with payload) 를 전달하여 다음 상태가 올바르게 변경되었는지 체크한다.

```js
// reducer
const initialState = 0;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'INCREMENT_BY':
      return state + action.payload;
    case 'DECREMENT_BY':
      return state - action.payload;
    default:
      return state;
  }
};
```

```js
describe('test reducer', () => {
  it('should return 0 as initial state', () => {
    expect(reducer(undefined, {})).toEqual(0);
  });

  it('should handle INCREMENT_BY', () => {
    expect(
      reducer(0, {
        type: 'INCREMENT_BY',
        value: 2,
      })
    ).toEqual(2);

    expect(
      reducer(5, {
        type: 'INCREMENT_BY',
        value: 10,
      })
    ).toEqual(15);
  });

  it('should handle DECREMENT_BY', () => {
    expect(
      reducer(5, {
        type: 'DECREMENT_BY',
        value: 2,
      })
    ).toEqual(3);
  });
});
```

다음과 같이 snapshot 테스트를 이용할수도 있다.

```js
it('should handle DECREMENT_BY', () => {
  const newState = reducer(5, {
    type: 'DECREMENT_BY',
    value: 2,
  });

  expect(newState).toMatchSnapshot();
});
```

### 참조

- [Testing Redux with Jest](https://dev.to/pixelplex/testing-redux-with-jest-2mfk)
- [A nice way to test redux reducers and actions](https://blog.thepete.net/blog/2019/07/15/a-nice-way-to-test-redux-reducers-and-actions---part-i/)
