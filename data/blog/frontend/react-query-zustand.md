---
title: react query & zustand 로 상태관리 하기
date: '2023-12-25'
tags: ['frontend', 'react query', 'zustand']
draft: false
summary: '프로젝트에서 사용중인 Redux에 여러 단점 들이 있어서 이를 대체하기 위한 react-query, zustand 를 알아보았다.'
---

프로젝트에서 사용중인 Redux에 여러 단점 들이 있어서 이를 대체하기 위한 react-query, zustand 를 알아보았다.

### (AS-IS) Redux 사용시 문제점

* API 데이터와 Client Side 데이터 들이 하나의 저장소에 혼재되어 있음.
* Redux 를 사용함으로써 간단한 API 호출, 데이터 저장시에도 action type, action, saga, reducer, selector 와 같이 구조화를 위한 보일러 플레이트가 비대해짐.
* API 호출시 데이터 캐시, 사용자 경험 향상등을 위한 로직들을 일일히 구현해주어야 함.

### AS-IS 개선을 위한 방안

* Server Side 데이터 와 Client Side 데이터를 분리하여 관리
   * Client Side: zustand
   * Server Side: react-query
* Flux 패턴과 같은 구조화는 유지하면서 보일러 플레이트를 많이 줄일 수 있는 라이브러리 사용 (zustand)
   * zustand 사용이유
     * redux와 같은 Flux 패턴을 사용하면서 많은 보일러플레이트 필요 X. 사용방법이 쉬움
     * 동일한 flux 패턴을 사용하는 redux devtool 로 디버깅 가능
     * 번들 사이즈가 작음
     * react와 함께 사용할 수 있는 API를 제공하되, react 종속적이지는 않음. - 따로 provider가 필요없음
       * 내부적으로 [useSyncExternalStore](https://www.npmjs.com/package/use-sync-external-store) 를 사용하여 react의 리렌더링 시스템에 올라갈 수 있도록 해줌
         * useSyncExternalStore는 외부 스토어를 subscribe해서 스냅샷의 변경 여부를 확인하고, 스냅샷이 변경되었을 때 강제로 리렌더링을 유발하기 위해 사용된다. 변경이 감지되면 forceUpdate를 통해 리렌더링이 강제된다.
   * zustand 리렌더링 방지를 위한 [useShallow](https://docs.pmnd.rs/zustand/guides/prevent-rerenders-with-use-shallow)
* API 호출시 데이터 캐시, 사용자 경험 향상등을 위한 비동기 로직들을 손쉽게 다룰 수 있는 라이브러리 활용 (react-query)
  * [API Caching](https://tanstack.com/query/latest/docs/react/guides/important-defaults)
    * useEffect에서 store에 데이터 있는지 체크해서 fetch action을 날리도록 구현할 필요없음 - gcTime, staleTime 옵션 설정으로 react query 에서 컨트롤
  * [prefetching](https://tanstack.com/query/v4/docs/react/guides/prefetching)
  * [infinite-queries](https://tanstack.com/query/latest/docs/react/guides/infinite-queries)
  * [API Retry](https://tanstack.com/query/latest/docs/react/guides/query-retries?from=reactQueryV3&original=https%3A%2F%2Ftanstack.com%2Fquery%2Fv3%2Fdocs%2Fguides%2Fquery-retries)
  * [Optimistic Update](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates?from=reactQueryV3&original=https%3A%2F%2Ftanstack.com%2Fquery%2Fv3%2Fdocs%2Fguides%2Foptimistic-updates)
  * [query-cancellation](https://tanstack.com/query/v3/docs/react/guides/query-cancellation)
  * [Persist Caching](https://react-query.tanstack.com/plugins/persistQueryClient)
  * [Refetch on window focus](https://tanstack.com/query/latest/docs/react/guides/window-focus-refetching?from=reactQueryV3&original=https%3A%2F%2Ftanstack.com%2Fquery%2Fv3%2Fdocs%2Fguides%2Fwindow-focus-refetching)
  * [dependent-queries](https://tanstack.com/query/v5/docs/react/guides/dependent-queries)
  * [v5 변경내용](https://tanstack.com/query/v5/docs/react/guides/migrating-to-v5)

### 적용

기존 Redux에서 action, saga, reducer, selector 로 나뉘어 있는 로직은 custom hook 으로 구현

아래 [프론트엔드 상태관리 실전 편 with React Query & Zustand](https://www.youtube.com/watch?v=nkXIpGjVxWU) 발표 자료 참고

<img src="/static/images/store-code-1.png" />

* Business Layer 는 필요하지 않은 경우 만들지 않고, 바로 Component에서 Store Layer를 사용할 수도 있다.

<img src="/static/images/store-code-2.png" />

<img src="/static/images/store-code-3.png" />

<img src="/static/images/store-code-4.png" />

<img src="/static/images/store-code-5.png" />

<img src="/static/images/store-code-6.png" />

<img src="/static/images/store-code-7.png" />

<img src="/static/images/store-code-8.png" width="600" />

### 테스트  

#### react query hook test

```tsx
// createQueryWrapper.tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

export function createQueryWrapper() {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );

  return Wrapper;
}
```


```ts
// useConsentInfo.test.ts
import { expect } from '@jest/globals';
import { renderHook } from '@testing-library/react-hooks';


import { ConsentAPI } from '@store/api';
import { createQueryWrapper } from '@tests/utility/createQueryWrapper';

import { useConsentInfo } from './useConsentInfo';

...

// guide : https://tanstack.com/query/v3/docs/react/guides/testing
describe('useConsentInfo', () => {
  it('fetch consent info', async () => {
    jest.spyOn(ConsentAPI, 'fetchConsentInfo').mockImplementation(
      //@ts-ignore
      () =>
        Promise.resolve({
          consents: consentList,
          decisionKey: 'testKey',
        })
    );

    const { result, waitFor } = renderHook(() => useConsentInfo({ consentId: ['testId'] }), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => !result.current.isConsentInfoLoading);
    expect(result.current.consentInfo?.decisionKey).toBe('testKey');
    expect(result.current.consentInfo?.consents?.length).toBe(consentList.length);
    expect(result.current.consentInfo?.testKey).toBe('test');
  });
});
```

#### zustand store hook test

`test/__mocks__/zustand.ts` 에 아래 파일 추가하면 유닛테스트시 zustand 내부에서 해당 경로에 파일이 있으면, 테스트시 해당 파일에 있는 create함수로 store를 생성한다. (zustand store를 모킹하고 테스트 실행 전 초기화 해주는 코드)

```ts
// zustand.ts
// https://docs.pmnd.rs/zustand/guides/testing
import * as zustand from 'zustand';
import { act } from '@testing-library/react';

const { create: actualCreate, createStore: actualCreateStore } = jest.requireActual<typeof zustand>('zustand');

// a variable to hold reset functions for all stores declared in the app
export const storeResetFns = new Set<() => void>();

const createUncurried = <T>(stateCreator: zustand.StateCreator<T>) => {
  const store = actualCreate(stateCreator);
  const initialState = store.getState();
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });
  return store;
};

// when creating a store, we get its initial state, create a reset function and add it in the set
export const create = (<T>(stateCreator: zustand.StateCreator<T>) => {
  console.log('zustand create mock');

  // to support curried version of create
  return typeof stateCreator === 'function' ? createUncurried(stateCreator) : createUncurried;
}) as typeof zustand.create;

const createStoreUncurried = <T>(stateCreator: zustand.StateCreator<T>) => {
  const store = actualCreateStore(stateCreator);
  const initialState = store.getState();
  storeResetFns.add(() => {
    store.setState(initialState, true);
  });
  return store;
};

// when creating a store, we get its initial state, create a reset function and add it in the set
export const createStore = (<T>(stateCreator: zustand.StateCreator<T>) => {
  console.log('zustand createStore mock');

  // to support curried version of createStore
  return typeof stateCreator === 'function' ? createStoreUncurried(stateCreator) : createStoreUncurried;
}) as typeof zustand.createStore;

// reset all stores after each test run
afterEach(() => {
  if (storeResetFns.size) {
    act(() => {
      storeResetFns.forEach((resetFn) => {
        resetFn();
      });
    });
  }
});
```

```ts
// useConsentAgreeInfoStore.test.ts
import { act, renderHook } from '@testing-library/react-hooks';

import { useConsentAgreeInfoStore, initialValue } from './useConsentAgreeInfoStore';

...

describe('useConsentAgreeInfoStore', () => {
  it('useConsentAgreeInfoStore action work', () => {
    const { result } = renderHook(() => useConsentAgreeInfoStore());
    const updateAgreeInfo = {
      [CONSENT_TYPE.TEST_TYPE]: TERM_AGREEMENT_TYPE.AGREE,
    };

    expect(result.current.agreeInfo).toBe(initialValue);
    act(() => result.current.setAgreeInfo(updateAgreeInfo));
    expect(result.current.agreeInfo).toMatchObject(updateAgreeInfo);
    act(() => result.current.resetAgreeInfo());
    expect(result.current.agreeInfo).toBe(initialValue);
  });
});
```

### 적용시 참고 할만한 링크

https://tkdodo.eu/blog/practical-react-query

https://github.com/ssi02014/react-query-tutorial

https://www.npmjs.com/package/zustand?ref=nextree.io

---

### 그 밖의 참조

- [프론트엔드 상태관리 실전 편 with React Query & Zustand](https://www.youtube.com/watch?v=nkXIpGjVxWU)

- [ContextAPI에서 Zustand로 갈아타기!](https://velog.io/@9rganizedchaos/Context-%ED%99%9C%EC%9A%A9%ED%95%B4%EC%84%9C-LTR-%ED%85%8C%EC%8A%A4%ED%8A%B8%ED%95%98%EA%B8%B0)

- [Zustand 동작 원리와 ExternalStore](https://ingg.dev/zustand-work/)