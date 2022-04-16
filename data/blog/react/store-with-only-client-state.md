---
title: Store에서 비동기 통신 분리하기 (with React Query)
date: '2022-02-26'
tags: ['react']
draft: false
summary: '우리가 사용하는 Store가 상당 부분 API 통신을 위한 코드들로 비대해진다. API 통신과 Server Side 상태 관리를 위한 더 나은 방법은 없을까?'
---

### 참고

https://techblog.woowahan.com/6339/

---

### Store와 비동기 통신

우리가 사용하는 Store가 상당 부분 API 통신을 위한 코드들로 비대해진다. <br />
Store는 전역 상태를 저장하고 관리하는 공간인데 상당 부분 비동기 통신을 위한 로직을 가지고 있는 것이 과연 Store의 역할에 맞는건인가? <br />
Store에서 비동기 통신을 위해 비효율적인 보일러플레이트나 로직들이 많아지고 있지는 않은가? <br />
API 통신과 Server Side 상태 관리를 위한 더 나은 방법은 없을까? <br />

위와 같은 의문에 대하여 다음의 해결방법들을 도출하고, 이를 위한 적정기술이 필요하게 되었다.

1. Store에서 비동기 통신을 걷어내고 온전한 Client Side 전역 상태 관리로 탈바꿈
2. 각종 API 통신과 sync를 맞춰야 하므로 Store 밖에서 서버와 관련된 상태 관리방안 마련
3. 2번이 가능하면서도 서버와 관련된 상태는 마치 전역 상태처럼 사용할 수 있어야 함

### React Query

위에서 고민한 문제에 대한 적정기술을 [React Query](https://react-query.tanstack.com/overview)로 선택하였다. <br />
React Query는 Server State를 관리하는 라이브러리로 React 프로젝트에서 Server와 Client 사이 비동기 로직들을 손쉽게 다루게 해주는 도구이다. <br />

이제 Server Side 전역상태와 비동기 통신을 위한 부분들은 React Query를 통해 관리하고 기존의 Store에서는 모두 걷어낸다. <br />

React Query 주요 내용들.. 자세한 내용은 공식 문서 참고.

- Fetching, 백그라운드에서 데이터 업데이트, key를 통한 Server Side 전역상태 관리 제공
- 개발자가 직접 구현할 필요없이 [캐싱을 위한 옵션](https://react-query.tanstack.com/guides/caching#_top)들을 제공
- create, update, delete API 호출을 위한 [useMutation](https://react-query.tanstack.com/guides/mutations) hook 제공
- [Optimistic Updates](https://react-query.tanstack.com/guides/optimistic-updates#_top) 기능 제공 (mutate시에 UI를 미리 업데이트 시켜두고 서버응답 결과에 따라 업데이트 유지 or 롤백하는 기능)
- Infinite scroll을 위한 [useInfinityQuery](https://react-query.tanstack.com/reference/useInfiniteQuery) hook 제공
- 서버 데이터 normalize를 위한 옵션 제공 : [select](https://react-query.tanstack.com/guides/migrating-to-react-query-3#query-data-selectors)사용 또는 queryFn 내부에서 return시 normalize
  (참고 : [React Query Data Transformations](https://tkdodo.eu/blog/react-query-data-transformations))

### 도입 시 좋은점과 고민할 부분

좋은 점

- Store가 한가지 역할(Client Side 전역 상태 관리)만을 수행한다.
- API 처리에 관한 로직과 보일러플레이트가 많이 줄어든다. (React Query에서 인터페이스 및 옵션 제공)
- 캐싱 전략을 일일히 구현하지 않아도 된다.

고민할 부분

- API 처리를 할 때 기존의 Redux가 가지고 있는 개발 패턴, 선언적인 구문들이 없어지기 때문에 Component 설계/분리를 잘 해야 한다.
