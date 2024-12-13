---
title: React Fiber 알아보기 2 (Lane 모델 도입 이유)
date: '2024-11-16'
tags: ['react', 'frontend']
draft: false
summary: 'React Fiber에서 lane 모델이 도입된 이유와 이를 통해 해결하고자 하는 것이 무엇인지 알아보자.'
---

[React Fiber 알아보기](/blog/frontend/react-fiber)에서 알아본 것처럼 React 18 부터 렌더링 작업의 우선순위는 lanes 로 관리된다.

React Fiber에서 lane 모델이 도입된 이유와 이를 통해 해결하고자 하는 것이 무엇인지 알아보자.

### React 18 이전의 Expiration Times model

React에서 스케줄링되는 React의 작업은 모두 우선순위가 정해져 있다.
이 모든 "작업" 들의 우선순위는 **"현재시간 + 우선순위에 따른 추가 시간"** 으로 만들어진 "만료시간"(실제 시간)을 기준으로 이루어지는데, 만료시간이 짧을수록 우선순위가 높은 우선순위이다.

Expiration Time은 두 가지 개념이 하나의 시간 데이터에 존재하였다.
* 우선순위: 업데이트를 발생시킨 이벤트를 기준으로 우선순위를 결정하고 업데이트 간 우선순위는 대소 비교를 통해 판단
* 배치 여부: 업데이트의 배치 여부는 값의 대소비교를 통해 판단

```typescript
const isTaskIncludedInBatch = priorityOfTask >= priorityOfBatch;
```


### React 18 부터의 Lane model

Lane model 을 도입한 이유에 대해 다음 PR 에 기술되어 있다.

https://github.com/facebook/react/pull/18796


> There are two primary advantages of the Lanes model over the Expiration Times model:
> * Lanes **decouple the concept of task prioritization** ("Is task A higher priority than task B?") **from task batching** ("Is task A part of this group of tasks?").
> * Lanes can express many distinct task threads with a single, 32-bit data type.

> This constraint was **designed before Suspense** was a thing, and it made some sense in that world. <br />
> When all your work is CPU bound, there's not much reason to work on tasks in any order other than by their priority. <br />
> But when you introduce tasks that are **IO-bound (i.e. Suspense)**, you can have a scenario where a **higher priority IO-bound task blocks a lower-priority CPU-bound task** from completing.

첫번째로는 Lanes 모델은 작업의 우선순위를 결정하는 개념과 작업의 배치 여부를 결정하는 개념을 분리한다. <br />
두번째로는 Lanes 모델은 하나의 32-bit 데이터 타입으로 여러 개의 작업 스레드를 표현할 수 있다.

그리고 IO-bound (Suspense 와 같은) 개념이 도입되면서, CPU-bound 작업보다 우선순위가 낮은 IO-bound 작업이 높은 우선순위의 CPU-bound 작업을 완료하지 못하게 하는 상황이 발생할 수 있어서 이에 대한 대응이 필요했던 것으로 보인다.

lane 모델이 도입이유가 React 18 부터 정식으로 지원되는 Suspense 와 관련이 깊어 Suspense 내용에 대해서도 알아본다.

#### Suspense

React 16.6 부터 실험적 기능으로 도입된 Suspense는 다음의 한 가지 use case 만 있었다.
* code splitting on the client with React.lazy

하지만 React 18 부터 정식으로 [Suspense](https://react.dev/reference/react/Suspense) 가 도입되었고, 다음과 같은 기능을 새로 제공한다.

* 스트리밍을 통한 서버 사이드 렌더링 지원
* Data fetching with Suspense
  * 단, Suspense-enabled framework ([Relay](https://relay.dev/docs/guided-tour/rendering/loading-states/) and [Next.js](https://nextjs.org/docs/app/getting-started)) 을 통한 data fetching 인 경우에 Suspense가 enable 된다.
* Reading the value of a Promise with [use](https://react.dev/reference/react/use)

React 18 Suspense 에 대한 자세한 내용은 다음을 참고한다. <br />
* https://github.com/reactjs/rfcs/blob/main/text/0213-suspense-in-react-18.md
* https://github.com/reactwg/react-18/discussions/7

---

### 참조

* https://goidle.github.io/react/in-depth-react18-lane/
* https://dev.to/okmttdhr/what-is-lane-in-react-4np7
* https://github.com/facebook/react/pull/18796

