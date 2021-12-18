---
title: React Query의 mutations 사용하기
date: '2020-11-11'
tags: ['react']
draft: false
summary: 'React Query 에서 지원하는 mutations 사용방법에 대한 정리'
---

## React Query 에서 지원하는 mutations 사용방법에 대한 정리

mutation은 react-query의 useMutation 훅을 사용하여 구현하며 create, update, delete API 호출시에 사용한다. <br />
자세한 사용방법은 다음 가이드를 참고한다. <br />
https://react-query.tanstack.com/guides/mutations

### useMutation 옵션

- onMutate : mutation 시작 전에 호출됨. 아래 예제에서 이를 활용하여 Optimistic Update 를 적용하였다.
- onError : 에러 콜백
- onSuccess : 성공 콜백
- onSettled : 성공, 실패 상관없이 요청이 끝났을 때 호출된다.

### mutation 객체

useMutation을 호출하면 mutation객체가 리턴된다. <br />
mutation에는 useMutation의 첫 번째 파라미터 함수를 호출하는 mutate가 존재한다.

### 사용 예제

다음의 사용 예제를 작성하였다.

- useMutation 사용
- mutation 완료시 query invalidation 적용
- mutation response를 통해 query invalidation 하지 않고, query data 업데이트
- mutation 호출 전에 optimistic update

**useSuperHeroesData.js**

```js
import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'

const SUPER_HERO_DATA_KEY = 'super-heroes'

const fetchSuperHeroes = () => {
  return axios.get('http://localhost:4000/superheroes')
}

const addSuperHero = (hero) => {
  return axios.post('http://localhost:4000/superheroes', hero)
}

export const useSuperHeroesData = (onSuccess, onError) => {
  return useQuery(SUPER_HERO_DATA_KEY, fetchSuperHeroes, {
    onSuccess,
    onError,
    // select: data => {
    //   const superHeroNames = data.data.map(hero => hero.name)
    //   return superHeroNames
    // }
  })
}

export const useAddSuperHeroData = () => {
  const queryClient = useQueryClient()

  return useMutation(addSuperHero, {
    onSuccess: (data) => {
      /** Query Invalidation Start */
      //queryClient.invalidateQueries(SUPER_HERO_DATA_KEY)
      /** Query Invalidation End */

      /** Handling Mutation Response Start */
      queryClient.setQueryData(SUPER_HERO_DATA_KEY, (oldQueryData) => {
        return {
          ...oldQueryData,
          data: [...oldQueryData.data, data.data],
        }
      })
      /** Handling Mutation Response End */
    },
    /**Optimistic Update Start */
    onMutate: async (newHero) => {
      await queryClient.cancelQueries(SUPER_HERO_DATA_KEY)
      const previousHeroData = queryClient.getQueryData(SUPER_HERO_DATA_KEY)
      queryClient.setQueryData(SUPER_HERO_DATA_KEY, (oldQueryData) => {
        //API 응답전에 미리 업데이트
        return {
          ...oldQueryData,
          data: [...oldQueryData.data, { id: oldQueryData?.data?.length + 1, ...newHero }],
        }
      })
      return { previousHeroData } //에러 발생시 onError에서 이전 data로 다시 복원하기 위함.
    },
    onError: (_err, _newTodo, context) => {
      queryClient.setQueryData(SUPER_HERO_DATA_KEY, context.previousHeroData)
    },
    onSettled: () => {
      queryClient.invalidateQueries(SUPER_HERO_DATA_KEY) // query invalidation. 서버로부터 다시 갱신
    },
    /**Optimistic Update End */
  })
}
```

**SuperHeroesPage.js**

```js
import { useState } from 'react'
import {
  useAddSuperHeroData,
  useSuperHeroesData
} from '../hooks/useSuperHeroesData'
import { Link } from 'react-router-dom'

export const RQSuperHeroesPage = () => {
  const [name, setName] = useState('')
  const [alterEgo, setAlterEgo] = useState('')

  const onSuccess = data => {
    console.log({ data })
  }

  const onError = error => {
    console.log({ error })
  }

  const { isLoading, data, isError, error, refetch } = useSuperHeroesData(
    onSuccess,
    onError
  )

  const {
      mutate: addHero,
      isLoading: isAddHeroLoading,
      isError: isAddHeroError,
      error: addHeroError,
      isSuccess: isAddHeroSuccess
  } = useAddSuperHeroData()

  const handleAddHeroClick = () => {
    const hero = { name, alterEgo }
    addHero(hero)
  }

  if (isLoading) {
    return <h2>Loading...</h2>
  }

  if (isError) {
    return <h2>{error.message}</h2>
  }

  return (
    // ...
  )
}
```

---

### 참조

- [react-query-demo github](https://github.com/gopinav/React-Query-Tutorials/tree/master/react-query-demo)
