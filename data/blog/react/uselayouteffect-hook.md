---
title: useEffect vs useLayoutEffect
date: '2021-08-29'
tags: ['react']
draft: false
summary: 'useEffect와 useLayoutEffect를 비교해보고, 언제 useLayoutEffect를 사용해야 하는지 알아본다.'
---

useEffect와 useLayoutEffect를 비교해보고, 언제 useLayoutEffect를 사용해야 하는지 알아본다.

#### useEffect

useEffect는 컴포넌트가 render와 paint된 후에 **비동기적**으로 실행된다. <br />
따라서 useEffect 내부에 dom에 영향을 주는 코드가 있다면 사용자는 화면 깜빡임을 보게된다.

![object](/static/images/useEffect.png 'object')

<br />

#### useLayoutEffect

useLayoutEffect는 컴포넌트가 render된 후 실행되며, useLayoutEffect가 **동기적**으로 실행이 완료된 후에 paint가 실행된다. <br />
useLayoutEffect는 컴포넌트를 paint 하기 전에 실행되기 때문에 내부에 dom 영향을 주는 코드가 있더라도 사용자는 화면 깜빡임을 경험하지 않는다.

![object](/static/images/useLayoutEffect.png 'object')

<br />

#### useEffect vs useLayoutEffect

useLayoutEffect는 동기적으로 실행되면서 내부 코드가 모두 실행 완료될 때까지 paint를 blocking한다. <br />
따라서 로직이 무거울경우, paint가 그만큼 지연되어 성능 문제가 발생할 수 있다. 그래서 기본적으로는 항상 useEffect를 사용하고, 화면 깜빡임 이슈가 발생한다면 useLayoutEffect 사용을 고려해보는 것이 좋다.

---

### 참조

- [How To Improve Performance Using useLayoutEffect In React Sites?](https://medium.com/front-end-weekly/how-to-improve-performance-using-uselayouteffect-in-react-sites-3a204888247e)
