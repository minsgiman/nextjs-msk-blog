---
title: Recoil (React 상태 관리 라이브러리)
date: '2022-05-07'
tags: ['frontend', 'recoil', 'react']
draft: false
summary: 'Recoil은 기존의 상태 관리 라이브러리들과 무엇이 다른가?'
---

### Recoil은 기존의 상태 관리 라이브러리들과 무엇이 다른가?

기존의 상태 관리 라이브러리들은 어떠한 문제도 없다. 하지만 중요한 점은 상태 관리 라이브러리들이 React 라이브러리가 아니라는 점이다. <br />
store는 "외부요인으로" 취급되는 것이기 때문에 React의 내부 스케줄러에 접근할 수 없다. 지금까지는 이것이 중요하지 않을 수도 있었다. 그러나 [동시성 모드](https://medium.com/swlh/what-is-react-concurrent-mode-46989b5f15da)가 등장하며 이야기가 달라졌다. 아마도 페이스북 소프트웨어 개발자들은 동시성 모드를 사용하고 있을 것이고, 그들이 React와 동시성 모드를 손쉽게 사용할 수 있는 해결 방안이 필요하였을 것이다 (Recoil은 내부적으로 React의 상태를 사용하고 있으며, 동시성 모드에 대한 지원도 곧 추가될 것이다).

또한 일부 라이브러리(Redux..)는 강력한 기능을 제공하지만, 기본적인 store 구성을 위해 많은 보일러 플레이트와 장황한 코드를 작성해야 한다. <br />
또한 비동기 데이터 처리 또는 계산된 값 캐시와 같은 중요한 기능은 라이브러리의 기능이 아니며, 이를 해결하기 위해 또 다른 라이브러리를 사용해야 한다. 그리고 만약 selector가 동적인 prop을 받는 경우 이값을 정확하게 memoization하는 것은 어려운 일이다.

### Context API를 사용하면?

Context API를 사용하면 컴포넌트 tree 상단과 leaf가 결합되는 강한 커플링이 생긴다. <br />
Context Provider의 값에 변경이 생기면, 그 Context를 구독하고 있는 하위의 모든 컴포넌트가 (일부분만 사용하더라도) 다시 렌더링 될 것이다. <br />
따라서 확정되지 않은 수의 값을 저장하는데는 적합하지 않으며 (테마나 locale과 같이 한번 설정하고 잘 변하지 않는 데이터에 활용하는 것이 좋다) 최적화 관점의 한계점이 명확하다.

### Recoil의 접근 방법

- Recoil은 React Component Tree에 직교되는 형태로 존재하는 방향 그래프로 구성되어 있다.
- 상태의 변경은 이 그래프를 따라 React Component로 흘러들어간다.
  - 다양한 장점들이 있지만, 가장 큰 장점으로 Component쪽의 로직을 건드리지 않고 상태 데이터를 단독으로 변경할 수 있다는 큰 장점이 있다.

<img src="/static/images/recoil.png" />

Recoil 설치는 [Recoil 시작하기](https://recoiljs.org/ko/docs/introduction/getting-started)를 참고한다.

### Recoil의 철학

- 보일러 플레이트가 적은 API면서 React의 로컬 상태(useState, useReducer)와 유사한 형태로 사용할 수 있는 간단한 인터페이스
- Concurrent Mode와 호환
- 코드 상호간의 낮은 결합도를 통해 Code splitting 용이성 확보
- 파생 데이터(selector)를 사용함으로써 데이터를 사용하는 컴포넌트에서 임의로 데이터를 바꾸는 로직을 가져가지 않아도 된다.
  - 가져와서 useEffect로 업데이트를 하지않고, 로직 자체를 Recoil에 귀속시킬 수 있다.

```js
useEffect(() => {
  (async () => {
    await updateFirstState();
    await updateSecondState();
    await updateThirdState();
  })();
}, []);
```

```js
const allInOneSelector = selector({
  key: 'allInOneSelectorKey',
  set: ({ set }) => {
    set(firstAtom, 1);
    set(secondAtom, 2);
    set(thirdAtom, 13);
  },
});

export default function App() {
  const setAllInOneSelector = useSetRecoilState(allInOneSelector);
  // ...
}
```

### Recoil Core Concept

- [Atom](https://recoiljs.org/ko/docs/api-reference/core/atom)

  - 데이터를 보관하는 기본 단위 (하나의 상태라고 볼 수 있다.)
  - atom의 값을 변경하면 그것을 구독하고 있는 컴포넌트들이 모두 다시 렌더링된다. atom을 생성하기 위해 어플리케이션에서 고유한 키 값과 디폴트 값을 설정해야한다.

- [Selector](https://recoiljs.org/ko/docs/api-reference/core/selector)
  - atom, 다른 selector들을 조합할 수 있음
  - 상태에서 파생된 데이터(derived state)를 생성한다.
  - 순수함수로 의존성 중 (사용하는 atom이나 selector) 어떠한 것이 업데이트 되면 re-compute 한다.
  - dependency에 해당되는 atom이 업데이트되면 같이 업데이트 되기 때문에 관리의 부담이 없음
  - Redux의 `reselect`와 MobX의 `@computed`처럼 동작하는 "get" 함수를 가지고 있다. 하지만 하나 이상의 atom을 업데이트 할 수 있는 "set" 함수를 옵션으로 받을 수 있다.

```js
const firstAtom = atom({
  key: 'firstAtomKey',
  default: 1,
});
const secondAtom = atom({
  key: 'firstAtomKey',
  default: 2,
});

const cumulatedAnswer = selector({
  key: 'cumulatedAnswerKey',
  get: ({ get }) => {
    return get(firstAtom) + get(secondAtom);
  },
});
```

### Recoil hook API

- [useRecoilState](https://recoiljs.org/ko/docs/api-reference/core/useRecoilState)

  - atom의 값을 구독하여 업데이트할 수 있는 hook. useState와 동일한 방식 (value, setter)으로 사용할 수 있다.

- [useRecoilValue](https://recoiljs.org/ko/docs/api-reference/core/useRecoilValue)

  - setter 함수 없이 atom의 값을 반환만 한다.

- [useSetRecoilState](https://recoiljs.org/ko/docs/api-reference/core/useSetRecoilState)
  - setter 함수만 반환한다.
  - 만약 컴포넌트가 setter를 가져오기 위해 useRecoilState() hook을 사용한다면 업데이트를 구독하고 atom 혹은 selector가 업데이트되면 리렌더링을 한다. useSetRecoilState()을 사용하는 것은 컴포넌트가 값이 바뀔 때 리렌더링을 하기 위해 업데이트를 구독하지 않고도 값을 설정하게 해준다.

atom, selector 모두 동일한 API (useRecoilState, useRecoilValue, useSetRecoilState) 를 통해 접근가 능하기에 변경이 필요할 때 언제든 Component 수정을 최소화하고 Recoil State를 변경할 수 있다.

#### [useRecoilCallback](https://recoiljs.org/ko/docs/api-reference/core/useRecoilCallback) 사용

- React의 useCallback과 유사하며, 다만 Recoil State를 사용할 수 있는 API를 제공한다.
- atom 혹은 selector가 업데이트 될 때 함수를 리렌더링하기 위해 업데이트를 구독하지 않고 비동기적으로 Recoil 상태를 읽기 위해 사용하기
- render-time에 하고 싶지 않은 시간이 오래 걸리는 비동기 액션 수행
- Recoil state를 read하거나 write하는 side-effect 수행

useRecoilCallback은 atom, selector state에 대한 snapshot을 가지고 있기 때문에 아래의 예제처럼 특정 상태값을 사용하고 싶지만, deps에는 반영하고 싶지 않을 때 유용하게 사용할 수 있다.

대표적으로 Logger와 같은 케이스에서 유용하게 사용할 수 있을 듯 하다.

```js
import { atom, useRecoilCallback } from 'recoil';

const itemsInCart = atom({
  key: 'itemsInCart',
  default: 0,
});

function CartInfoDebug() {
  const logCartItems = useRecoilCallback(({ snapshot }) => async () => {
    const numItemsInCart = await snapshot.getPromise(itemsInCart);
    console.log('Items in cart: ', numItemsInCart);
  });

  return (
    <div>
      <button onClick={logCartItems}>Log Cart Items</button>
    </div>
  );
}
```

아래의 예제에서는 nextTodoId가 바뀔 때마다 함수가 새로 생성되지 않고, add 함수가 호출될 때 그 내부에서 현재의 nextTodoId를 조회한다.

```js
import {useMemo} from 'react'
import {useRecoilCallback, useSetRecoilState} from 'recoil'
import {nextTodoId, todosState} from '../atoms/todos'

export default function useTodosActions() {
    const set = useSetRecoilState(todosState)
    const add = useRecoilCallback({ snapshot } => async (text) => {
        const nextId = await snapshot.getPromise(nextTodoId)
        set(prev => prev.concat({id: nextId.toString(), text, done: false}))
    }, [])

  // ...
}
```

### Selector가 데이터를 SET 할 수 있다고?

위에서 selector에 대해 이야기 할 때 setter 함수를 selector에 전달할 수 있다고 언급하였다. 이상해보이지만, 단지 네이밍 때문에 혼란스러운 것이다 (그리고 바뀌길 바란다). selector를 하나의 상태이지만 파생된 것으로 생각해보자. selector는 atom로부터 계산된 값을 얻을 수 있고, 또한 복수의 atom에게 영향을 줄 수도 있다.

```js
const colorCounterState = selector({
  key: 'colorCounterState',
  get: ({ get }) => {
    let counter = { [COLORS.RED]: 0, [COLORS.BLUE]: 0, [COLORS.WHITE]: 0 };
    for (let i = 0; i < BOX_NUM; i++) {
      const box = get(boxState(i));
      counter[box] = counter[box] + 1;
    }
    return counter;
  },
  set: ({ set }) => {
    for (let i = 0; i < BOX_NUM; i++) {
      set(boxState(i), COLORS.WHITE);
    }
  },
});
```

### 비동기 데이터 쿼리

Recoil은 데이터 플로우 그래프를 통해 상태를 매핑하는 방법과 파생된 상태를 리액트 컴포넌트에 제공한다. <br />
가장 강력한 점은 graph에 속한 함수들도 비동기가 될 수 있다는 것이다. 이는 비동기 함수들을 동기 리액트 컴포넌트 렌더 함수에서 사용하기 쉽게 해준다. <br />
Recoil은 동기와 비동기 함수들을 selector의 데이터 플로우 그래프에서 균일하게 혼합하게 해준다. <br />
Selector get콜백에서 나온 값 그 자체 대신 프로미스를 리턴하면 인터페이스는 정확하게 그대로 유지된다. 이들은 Selector일 뿐이므로 다른 selector들에 의존하여 데이터를 추가로 변환 할 수도 있다. <br />

```js
const currentUserNameQuery = selector({
  key: 'CurrentUserName',
  get: async ({ get }) => {
    const response = await myDBQuery({
      userID: get(currentUserIDState),
    });
    return response.name;
  },
});

function CurrentUserInfo() {
  const userName = useRecoilValue(currentUserNameQuery);
  return <div>{userName}</div>;
}
```

하지만, React 렌더 함수가 동기인데 promise가 resolve 되기 전에 React 컴포넌트가 무엇을 렌더 할 수 있을까? <br />
Recoil은 보류중인 데이터를 다루기 위해 [React Suspense](https://17.reactjs.org/docs/concurrent-mode-suspense.html)와 함께 동작하도록 디자인되어 있다. <br />
컴포넌트를 Suspense의 경계로 감싸는 것으로 아직 보류중인 하위 항목들을 잡아내고 대체하기 위한 UI를 렌더한다. <br />

```js
function MyApp() {
  return (
    <RecoilRoot>
      <React.Suspense fallback={<div>Loading...</div>}>
        <CurrentUserInfo />
      </React.Suspense>
    </RecoilRoot>
  );
}
```

또한 요청에 에러가 있는 경우 Recoil selector는 컴포넌트에서 특정 값을 사용하려고 할 때에 어떤 에러가 생길지에 대한 에러를 던질 수 있다. <br />
이는 [React ErrorBoundary](https://reactjs.org/docs/error-boundaries.html)로 잡을 수 있다.

```js
const currentUserNameQuery = selector({
  key: 'CurrentUserName',
  get: async ({ get }) => {
    const response = await myDBQuery({
      userID: get(currentUserIDState),
    });
    if (response.error) {
      throw response.error;
    }
    return response.name;
  },
});

function CurrentUserInfo() {
  const userName = useRecoilValue(currentUserNameQuery);
  return <div>{userName}</div>;
}

function MyApp() {
  return (
    <RecoilRoot>
      <ErrorBoundary>
        <React.Suspense fallback={<div>Loading...</div>}>
          <CurrentUserInfo />
        </React.Suspense>
      </ErrorBoundary>
    </RecoilRoot>
  );
}
```

비동기 데이터 쿼리에 대한 자세한 내용은 다음을 참고한다. <br />
https://recoiljs.org/ko/docs/guides/asynchronous-data-queries

---

## 참고

- [Recoil: A New State Management Library Moving Beyond Redux and the Context API](https://betterprogramming.pub/recoil-a-new-state-management-library-moving-beyond-redux-and-the-context-api-63794c11b3a5)
- [Recoil - 또 다른 React 상태 관리 라이브러리?](https://ui.toast.com/weekly-pick/ko_20200616)
- [왜 Recoil을 써야 하는가?](https://www.youtube.com/watch?v=H10KNVxF6_s)
- [recoil 공식문서](https://recoiljs.org/ko/)
