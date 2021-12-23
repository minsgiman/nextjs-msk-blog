---
title: Intersection Observer 를 사용한 Infinite Scroll
date: '2021-09-02'
tags: ['javascript', 'frontend']
draft: false,
summary: 'Intersection Observer API는 Target Element가 Viewport내에 노출되었는지 여부를 구독할 수 있는 API이다.'
---

[Intersection Observer API](https://developer.mozilla.org/ko/docs/Web/API/Intersection_Observer_API)는 Target Element가 Viewport내에 노출되었는지 여부를 구독할 수 있는 API이다.

Intersection Observer가 등장하기 전에는 어떤 요소가 화면에 보여지는지 감지하는 것은 매우 복잡한 일이었다.

intersection 정보는 아래와 같은 여러가지 이유 때문에 필요하다.

- 이미지의 Lazy Loading이나 페이지 스크롤 시 컨텐츠 로딩
- 무한 스크롤 구현
- 광고들이 실제로 유저에게 노출되는지 보고하기 위해
- 유저가 결과를 보는지에 따라 특정 애니메이션이나 task를 수행할 지 여부를 결정하기 위해

과거에 intersection 감지를 구현하면 영향을 받는 모든 요소를 알기 위해서 Element.getBoundingClientRect()와 같은 메서드를 호출하는 여러 이벤트 핸들러와 루프가 얽혀 있었다.

이는 모든 코드가 메인 스레드에서 실행되기 때문에, 성능 문제로 연결될 수 있다.

유저가 스크롤을 조금만 움직여도 scroll listener가 계속 발생할 것이고 성능에 안좋은 영향을 미칠 것이다.

Throttling 사용 등으로 보완할 수 있지만 성능 문제를 완전히 해결할 수는 없다.

반면 Intersection Observer API는 관찰하고자 하는 타켓 요소가 "다른 요소([root](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/root) 옵션으로 설정) 또는 viewport"에 들어오거나 나갈 때마다 감지하여 미리 등록된 콜백 함수를 실행시킨다.

이 경우에 더 이상 웹 사이트는 요소의 intersection을 관찰하기 위해 메인 쓰레드를 사용할 필요가 없어진다.

다만 Intersection Observer로는 아주 정확하게 몇 pixel이 교차되었는지는 알아낼 수 없다.

그렇기 때문에 정확한 pixel 값 보다는 대략 N%가 교차되었는지 정하는 식으로 사용한다.([threshold](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/thresholds) 옵션으로 설정)

### useIntersectionObserver

IntersectionObserver 을 사용하기 위한 hook을 구현하였다.

isInfinite Param을 통해 Viewport 노출을 한번만 감지할지, 계속 감지할지 설정한다.

한번만 감지하는 경우는 이미지 Lazy Loading등에 사용되고, 계속 감지하는 경우는 무한 스크롤에 사용된다.

```ts
/* useIntersectionObserver.tsx */
import React, { useEffect, useState } from 'react'

type IUseIntersectionObserverParams = {
  ref: React.RefObject<HTMLElement> | null
  isInfinite?: boolean
  onIntersect?: () => void
}

export function useIntersectionObserver({
  ref,
  isInfinite,
  onIntersect,
}: IUseIntersectionObserverParams) {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    let observer: IntersectionObserver

    if (ref) {
      observer = new IntersectionObserver(([entry], observer) => {
        if (entry.isIntersecting) {
          if (!isInfinite) {
            observer.unobserve(entry.target)
          }

          if (!isIntersecting) {
            setIsIntersecting(true)
          }
          onIntersect?.()
          console.log('[useIntersectionObserver] intersect target')
        }
      })

      ref.current && observer.observe(ref.current)
    }

    return () => {
      observer?.disconnect()
    }
  }, [ref])

  return isIntersecting
}
```

### InfiniteScrollBox

InfiniteScrollBox 컴포넌트를 구현하였다.

제일 하단에 Loading과 Intersection Observer 감지를 위한 요소를 제공한다.

```ts
/* InfiniteScrollBox.tsx */
import React, { createRef } from 'react'

import { useIntersectionObserver } from '@hooks'
import { LoadingContent } from '@components-common/atoms/loading'

export interface IInfiniteScrollBoxProps {
  isLoading?: boolean
  onIntersect?: () => void
  children?: React.ReactNode
}

export function InfiniteScrollBox({ isLoading, onIntersect, children }: IInfiniteScrollBoxProps) {
  const bottomRef = createRef<HTMLDivElement>()

  useIntersectionObserver({
    ref: bottomRef,
    isInfinite: true,
    onIntersect,
  })

  return (
    <>
      {children}
      {isLoading && <LoadingContent />}
      <div ref={bottomRef}></div>
    </>
  )
}
```

#### InfiniteScrollBox 사용

InfiniteScrollBox 컴포넌트를 사용하여 List에 무한스크롤을 적용하였다. (Intersection시 추가로딩)

```javascript
/* MainList.js */

const PAGE_SIZE = 10

const MainList = ({ fetchApi, apiActionTypes }) => {
  const dispatch = useDispatch()

  const { items, pageToken } = useSelector(getMainList)
  const loading = useSelector(getLoading(apiActionTypes))

  const isEmptyList = useMemo(() => ObjectUtility.isEmpty(items), [items])

  const handleIntersect = useCallback(() => {
    if (!ObjectUtility.isEmpty(pageToken) && !loading && items.length >= PAGE_SIZE) {
      handleFetchBoard()
    }
  }, [pageToken, loading, items])

  const handleFetchBoard = useCallback(() => {
    dispatch(
      fetchApi({
        payload: pageToken,
      })
    )
  }, [pageToken])

  return (
    <InfiniteScrollBox isLoading={loading} onIntersect={handleIntersect}>
      <ul>
        {items.map((item) => (
          <BoardItem key={item.id} title={item.title} />
        ))}
      </ul>
    </InfiniteScrollBox>
  )
}
```

---

### 참조

- [MDN - Intersection Observer API](https://developer.mozilla.org/ko/docs/Web/API/Intersection_Observer_API)

- [Infinite Scroll with Intersection Observer](https://im-developer.tistory.com/196)
