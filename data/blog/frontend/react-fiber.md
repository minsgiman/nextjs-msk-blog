---
title: React Fiber 알아보기
date: '2024-09-17'
tags: ['react', 'frontend']
draft: false
summary: 'Fiber reconciler 는 위의 Stack reconciler 가지고 있던 취약점을 보완하기 위해 만들어졌다.'
---

## 기존 Stack reconciler의 문제점

<img src="/static/images/stack-reconciler.png" />

기존의 [Stack reconciler](https://ko.legacy.reactjs.org/docs/implementation-notes.html) 에서는 렌더링 작업 들을 처리할 때 Virtual DOM 트리를 DFS로 순회하면서 **깊은 콜스택** 을 만들어 **동기적으로 하나의 큰 task로 실행** 하였다. <br />
이 때문에 렌더링 작업이 많아지면 렌더링 작업이 끝날 때까지 브라우저는 다른 작업을 수행할 수 없었다.  

<img src="/static/images/stack-blocking.png" />

<img width="200" src="/static/images/react-stack.png" />

따라서 **concurrency의 핵심인 "pause, resume, abort, priority" 가 기존 시스템에서 불가능**하였다.


## Fiber reconciler

Fiber reconciler 는 위의 Stack reconciler 가지고 있던 취약점을 보완하기 위해 만들어졌다. <br />
Fiber 노드는 각 React component 의 현재 렌더링 정보를 가지고 있고, 변경 사항에 대한 작업을 관리한다. (unit of work)

<img src="/static/images/fiber-reconciler.png" />

Fiber 노드가 가지고 있는 property 는 다음과 같다. 자세한 내용은 뒤에서 알아본다.

<img src="/static/images/fiber-property.png" />

## Pause & Resume in Fiber reconciler

Stack reconciler 에서는 불가능했던 concurrency (pause, resume, abort, priority) 가 Fiber reconciler 에서는 가능해지는데, Fiber 에서는 다음과 같이 현재 처리중인 노드 및 다음 처리할 노드의 포인터를 관리한다.

* Fiber 노드에 있는 ```return, sibling, child``` 를 통해 다음 처리해야 할 fiber 를 찾아간다.
* 현재 처리중인 Fiber 노드는 **workInProgress** 로 표시한다. 

<img width="500" src="/static/images/double-buffer.png" />

<img width="300" src="/static/images/workloop.png" />

렌더링을 중간에 pause 하더라도 workInProgress 노드를 기억하고 있기 때문에 workLoop로 들어와서 다시 resume 할 수 있다. <br />
또한 commit 단계에서 변경 내용을 한번에 반영하므로, commit 단계 전에 중단되어도 실제 렌더 된 화면에는 영향을 미치지 않는다.

## 더블 버퍼링 구조

> Front Buffer를 화면에 출력하는 동안 Back Buffer에서 다음에 그려질 내용을 쓴다.

Fiber는 ```alternate``` 를 통해 다음 두개가 서로를 가리키는 더블 버퍼링 구조로 되어 있다.

* current : 현재 브라우저 DOM에 반영된 정보를 그대로 가지고 있는 Fiber 노드
* workInProgress : 렌더링 작업을 처리하는 Fiber 노드

다음과 같이 렌더링 작업 처리할 때 current와 workInProgress 를 비교하여 변경사항이 있는지 체크한다.

```js
beginWork(current, workInProgress, lanes) //변경 체크하여 변경사항 flag 셋팅하고, 다음 노드로 이동 
```

Fiber 트리를 모두 순회하여 렌더링이 완료되면, workInProgress 를 current 로 변경한다.

## 우선순위 모델 lane

react 18 부터 렌더링 작업의 우선순위는 ```lanes``` 로 관리된다.

[lane 은 bit mask](https://github.com/facebook/react/blob/5a1e558df21bd3cafbaea01cc418fa69d14a8cab/packages/react-reconciler/src/ReactFiberLane.new.js)로 표현 되며, 다음과 같이 업데이트의 시작점 이벤트에 대응되어 결정된다.

* SyncLane: 사용자의 물리적 행위 중 개별적으로 처리해야 하는 이벤트(DiscreteEvent)
  * click, input, mouse down, submit…
* InputContinuousLane: 사용자의 물리적 행위 중 연속적으로 발생하는 이벤트(ContinuousEvent)
  * drag, scroll, mouse move, wheel…
* DefaultLane: 기타 모든 이벤트, 리액트 외부에서 발생한 업데이트
  * setTimeout, Promise..
* TransitionLane: 개발자가 정의한 전환 이벤트
  * startTransition(), useTransition()를 통해 생성된 업데이트

<br />

lane으로 우선순위가 관리되는 React 렌더링 순서는 다음과 같이 진행된다.

1. re-render를 일으키는 변경등이 발생하면 컴포넌트는 update 를 만들어서 dispatch 한다.
2. dispatch 시에 update에는 lane이 설정되고, update는 Fiber 노드에서 관리하는 큐에 등록된다. (lane을 설정할 때 root 에도 같이 기록되어, 이후 root에서 어떤 lane을 먼저 처리할지 결정할 수 있다.)
3. 렌더링을 시작하면 root에서 getNextLanes() 를 조회하여 root 로부터 tree를 순회하면서 렌더링을 시작한다. 
   * 한번의 렌더링에서 하나의 lanes 만 선택해서 처리한다.
   * 해당 lanes 보다 우선순위가 낮은 업데이트는 건너뛰어 다음 렌더링으로 밀린다.
4. workLoop 안에서 beginWork, completeWork 를 통해 렌더링 작업을 처리한다.
   * beginWork(current, workInProgress, lanes) : 변경 체크하여 markUpdate (변경사항 flag 셋팅). 다음 노드로 이동
   * completeWork(current, workInProgress, lanes) : tree bottom까지 가면 completeWork 호출 -> 여기서 DOM Instance tree 를 construct -> works back up
5. tree를 모두 순회하여 렌더링 작업이 완료되면, commit 단계에서 변경사항을 반영한다. 
   * ```firstEffect, nextEffect, lastEffect``` 를 통해 변경이 있는 fiber linked list 를 commit phase에 전달한다.

<br />

lanes 모델로 같은 lane에 있는 update 들은 배치처리하고, 중간 상태는 건너뛸 수 있다.

<img width="400" src="/static/images/react-lanes.png" />

또한 lane 에 따라서 렌더링 방식이 달라지는데, transitionLane은 concurrent 모드로 동작한다.

<img src="/static/images/concurrent-mode.png" />

concurrent 모드에서는 일정주기로 브라우저에 메인 스레드를 양보한다.

<img src="/static/images/sync-concurrent.png" />


## 렌더링 Abort by priority

Fiber reconciler 에서는 렌더링 작업 중 현재 처리하고 있는 작업보다 높은 우선순위의 update가 들어오면, 현재 렌더링을 abort 하고, 높은 우선순위의 update를 처리한다.

Fiber 노드에 있는 ```memoizedState``` 를 살펴보자.

<img src="/static/images/memoized-state.png" />

* Fiber의 memoizedState에는 컴포넌트에서 사용된 Hook을 연결 리스트 형태로 참조하고 있습니다([참고](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberHooks.new.js#L676-L677)).
* Hook의 memoizedState에는 반영된 상태를 참조하고 있습니다([참고](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberHooks.new.js#L896)).
* Hook에는 업데이트를 담을 큐를 가지고 있습니다([참고](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberHooks.new.js#L1514-L1521)).
* 업데이트는 해당 Hook의 큐에 연결 리스트 형태로 추가됩니다([참고](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberConcurrentUpdates.new.js#L67-L77)).
* 업데이트에는 Lane이 할당됩니다([참고](https://github.com/facebook/react/blob/v18.2.0/packages/react-reconciler/src/ReactFiberHooks.new.js#L2243-L2251)).

memoizedState 의 업데이트는 우선순위에 따라 다음과 같이 처리된다. 중간에 우선순위가 높은 업데이트 (sync lane)가 들어오면, 현재 렌더링을 중단하는 것을 확인할 수 있다.  

<img src="/static/images/abort-priority.png" />

## Fiber Property

위에서 언급하지 않은 나머지 Fiber 노드의 property 설명. 

#### ```memoizedProps, pendingProps```

렌더링시 둘을 비교해서 변경사항이 있는지 확인한다.

#### [flags](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberFlags.js)

어떤 변경이 발생했는지 변화의 유형 (markUpdate에서 기록된다.)

#### [tag](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactWorkTags.js)

어떤 유형의 컴포넌트인지 나타낸다.

#### ```key```

Fiber가 가리키는 인스턴스의 고유한 식별자 (우리가 알고 있는 key)

#### ```type```

컴포넌트의 경우 이 인스턴스를 만드는 함수, 혹은 클래스. Html 요소의 경우 ‘div’ 와 같은 DOM 요소를 나타내는 문자열. 루트 fiber의 경우 null.

#### ```stateNode```

dom element

---

### 참조

- https://blog.mathpresso.com/react-deep-dive-fiber-88860f6edbd0
- https://goidle.github.io/
- https://tv.naver.com/v/23652451#comment_focus


