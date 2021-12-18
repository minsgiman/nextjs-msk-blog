---
title: React Query의 infinite query 사용하기
date: '2020-11-11'
tags: ['react']
draft: false
summary: 'react query 에서 지원하는 infinite query 사용방법에 대한 정리'
---

react query 에서 지원하는 infinite query 사용방법에 대한 정리

자세한 사용방법은 다음 가이드를 참고한다. <br />
https://react-query.tanstack.com/reference/useInfiniteQuery

```js
async function getCharacters(page) {
  const response = await fetch(`https://test/api/character?page=${page}`)
  const characters = await response.json()
  return characters
}

const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery(
  ['GetCharactersKeyQuery'],
  ({ pageParam = 1 }) => getCharacters(pageParam),
  {
    getNextPageParam: (lastPage) => {
      if (lastPage.projects.pageInfo.hasNextPage) {
        return lastPage.projects.pageInfo.endCursor
      }
      // return undefined means no next page
      return undefined
    },
  }
)

const handleEndReached = () => {
  fetchNextPage()
}
```

- getNextPageParam(옵션) : Query 결과로 받은 lastPage를 전달받아서, next page param을 return 한다. undefined이면 next page가 없다는 의미.
- hasNextPage(리턴) : next page가 존재하는지 유무. getNextPageParam 을 통해 결정된다.
