---
title: React Testing Library 로 React Hook 테스트하기
date: '2022-05-29'
tags: ['react', 'test']
draft: false
summary: '리액트 커스텀 훅을 테스트하기 위해서 여러 가지 방법을 사용할 수 있다. 그중에 testing-library를 사용하여 진행한다.'
---

리액트 커스텀 훅을 테스트하기 위해서 여러 가지 방법을 사용할 수 있다.

1. [라이브러리 없이 훅 테스트하기](https://www.toptal.com/react/testing-react-hooks-tutorial)
2. 커스텀 훅을 사용하는 테스트 컴포넌트를 만들고 해당 컴포넌트를 테스트한다.
3. `@testing-library/react-hooks`의 renderHook을 사용한다.

그중에 3번 testing-library를 사용하여 진행한다.

### 설치

[react component 테스트 시](/blog/react/react-component-test)에 설치했던 라이브러리 외에 추가로 다음 github을 참고하여 설치한다. <br />

- [testing-library/react-hooks](https://github.com/testing-library/react-hooks-testing-library)

### 테스트 작성

1. count 증감 hook을 테스트 한다. <br />
   - state 업데이트 함수호출을 act로 감싸서 다음 테스트 진행전에 렌더링 업데이트 반영을 기다린다.

```js
test('should display initialValue and increment if passed', () => {
  const { result } = renderHook(() => useCounter(300))

  expect(result.current.count).toBe(300)

  act(() => {
    result.current.increment()
  })

  expect(result.current.count).toBe(301)
})
```

```js
test('v2 - allows customization of the step', () => {
  const { result } = renderHook(useCounter, { initialProps: { step: 2 } })
  expect(result.current.count).toBe(0)

  act(() => result.current.increment())
  expect(result.current.count).toBe(2)

  act(() => result.current.decrement())
  expect(result.current.count).toBe(0)
})
```

2. hook 렌더 함수인 renderReadModelHook 를 구현한다. <br />
   - 반복적인 테스트에서 재사용할 수 있다.

```js
const renderReadModelHook = (
  query: ReadModelQuery,
  initialState: any,
  options?: ReduxReadModelHookOptions
) => {
  const {
    result: { current },
  } = renderHook(() => useReduxReadModel(query, initialState, options))
  return current
}
```

3. 마운트시에 API fetch를 수행하는 hook을 테스트한다. <br />
   - fetch를 mocking하고, waitForNextUpdate 로 다음 렌더링 업데이트를 기다린다.

```js
describe('Fetch Data on Mount Hook', () => {
  it('calls fetch with the given id and resource', async () => {
    const expected = { complete: false, id: '1', title: 'something', userId: '2' }
    fetch.mockResponseOnce(JSON.stringify(expected))

    const props = {
      id: '1',
      resource: 'todo',
    }

    const { result, waitForNextUpdate } = renderHook(() => useFetchDataOnMount(props))

    await waitForNextUpdate()

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/todo/1')

    expect(result.current).toEqual(expected)
  })
})
```

```js
describe('use the fetch', () => {
  it('initial data state is loading and data empty', () => {
    const { result } = renderHook(() => useTheFetch('people'))

    expect(result.current).toStrictEqual({ loading: true, data: null })
  })

  it('data is fetched and not loading', async () => {
    const fakeSWData = { result: [{ name: 'Luke Skywalker' }] }
    getStarWars.mockResolvedValue(fakeSWData)
    const { result, waitForNextUpdate } = renderHook(() => useTheFetch('people'))

    await waitForNextUpdate()

    expect(getStarWars).toBeCalledWith('people')
    expect(result.current).toStrictEqual({
      loading: false,
      data: fakeSWData,
    })
  })
})
```

---

### 참고

- [리액트 커스텀 훅을 테스트하는 과정](https://meetup.toast.com/posts/321)
- [A Complete Guide to Testing React Hooks](https://www.toptal.com/react/testing-react-hooks-tutorial)
