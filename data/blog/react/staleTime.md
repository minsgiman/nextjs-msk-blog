---
title: React Query에서 cacheTime과 staleTime의 차이
date: '2022-10-22'
tags: ['react', 'swr']
draft: false
summary: 'staleTime은 얼마나 오래 response를 fresh(or not stale)한 것으로 여길지를 정의한다. response가 fresh 하다면 새로운 request를 보낼 필요가 없다.'
---

### React Query에서 cacheTime과 staleTime

`cacheTime`은 얼마나 오래 response를 메모리에 cache하고 있을지를 정의한다. (garbage collection 되기 전에)

`staleTime`은 얼마나 오래 response를 fresh(or not stale)한 것으로 여길지를 정의한다. response가 fresh 하다면 새로운 request를 보낼 필요가 없다.

### React Query default 설정

React Query에서 default는 `cacheTime`은 5분 `staleTime`은 0이다. <br />
이것은 다음과 동작을 의미한다.

- React Query가 항상 요청이 완료된 후 5분동안 응답을 캐시한다.
- 사용자가 다음번에 다시 query를 할 때 기존 캐시를 먼저 사용자에게 보여준 후에 기존 응답캐시는 항상 stale(or not fresh) 한 것으로 여기고, 백그라운드에서 서버로 두 번째 request를 다시 보낸다. <br />
- 두 번째 request가 완료되면 새로운 response data로 UI를 업데이트한다.

### staleTime을 증가시키면?

`cacheTime`은 5분 `staleTime`은 1분 으로 설정하는 것으로 가정한다.

1. 00:00:00에 data를 fetch 한다. response는 React Query에 의해 5분 동안 캐시되어 저장되고, 다음 1분 동안 fresh한 것으로 여겨진다.
2. 00:00:30에 동일한 key에 대해 새로운 query를 trigger한다.
   - 먼저 cache가 여전히 유효하기 때문에 이것을 즉시 유저에게 제공한다.
   - 그 다음에 query가 여전히 fresh하기 때문에 백그라운드에서 새로운 fetch를 요청하지 않는다.
3. 00:04:30에 동일한 key에 대해 새로운 query를 trigger한다.
   - 먼저 cache가 여전히 유효하기 때문에 이것을 즉시 유저에게 제공한다.
   - query가 이제 stale하기 때문에 React Query는 background에서 fetch함수를 call한다.
   - 새로운 response를 받으면 React Query는 캐시한 data를 업데이트하고 다음 5분동안 저장한다.

### 설정은 어떻게?

일반적인 경우 `cacheTime`, `staleTime` default 설정을 그대로 따르는 것이 좋다.

만약 데이터가 시간이 지나도 거의 변하지 않는다면 이런 경우에 `staleTime`을 늘리는 것을 고려해볼 수 있다. <br />
단 `staleTime`은 `cacheTime`을 초과해서는 안된다.

---

### 참조

- [React Query: cacheTime vs staleTime](https://medium.com/doctolib/react-query-cachetime-vs-staletime-ec74defc483e)

- [Caching Examples](https://tanstack.com/query/v4/docs/guides/caching?from=reactQueryV3&original=https://react-query-v3.tanstack.com/guides/caching#_top)
