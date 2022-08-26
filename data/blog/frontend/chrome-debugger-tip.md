---
title: 크롬 개발자 도구 팁
date: '2022-01-23'
tags: ['frontend']
draft: false
summary: '잘 모를 수도 있는 크롬 개발자 도구 팁 정리'
---

잘 모를 수도 있는 크롬 개발자 도구 팁 정리

### Console 탭

#### designMode

- 사용방법 : console -> document.designMode = 'on'
- page에서 text를 바로 변경가능. 글자가 길어져서 레이아웃 깨지거나 할때 사용해볼 수 있다.

#### monitorEvents

- 사용방법 : console -> monitorEvents

  ```js
  monitorEvents(object [, events]).
  ```

  ```js
  monitorEvents(window, ['click', 'scroll']); // 버블링 되서 모든 요소 이벤트 다 찍힘
  unmonitorEvents(window, ['click', 'resize', 'scroll']);
  ```

- 참고 : https://developers.google.com/web/updates/2015/05/quickly-monitor-events-from-the-console-panel

#### live expression

- 사용방법 : console -> live expression (눈알 모양) -> expression 등록
- 실시간으로 expression 값 모니터링

  ```js
  document.querySelector('input#search').value;
  // apple
  ```

#### const 재선언

- 이전에는 console에서 다음과 같이 입력하면 에러가 났었는데, chrome 92버전부터 재선언 가능하도록 됨

  ```js
  const foo = 23;
  const foo = 24;
  ```

<br />

### network 탭

#### preserve log

- Preserve log 체크
- 페이지가 다른 url로 이동되어도 기존 기록한 로그를 유지

#### DOMContentLoaded, Load, Finish 이벤트

- 페이지 로드 시 network 탭 하단에 표시됨
  - DOMContentLoaded : 브라우저가 initial HTML을 전부 읽고 DOM 트리를 완성하는 즉시 발생. 이미지 파일(&lt;img&gt;)이나 스타일시트 등의 기타 자원은 기다리지 않음.
  - Load : HTML로 DOM 트리를 만드는 게 완성되었을 뿐만 아니라 JS, 이미지, 스타일시트 같은 외부 자원도 모두 불러오는 것이 끝났을 때 발생.
  - Finish : 마지막 리퀘스트가 끝났을때 (async javascript, http request들 까지 포함)

<br />

### Sources 탭

#### logpoint

- console.log를 코드에 추가하지 않고서도 sources탭에서 원하는 source위치에 logpoint 추가하여, console에서 확인 가능
- 참고 : https://developer.chrome.com/blog/new-in-devtools-73/#logpoints

#### Ignore List

- 디버깅에 방해되는 외부 라이브러리 등을 ignore list 에 추가할 수 있음
- 추가된 스크립트는 debugger의 step in, out 에서 건너뜀
- 참고 : https://developer.chrome.com/docs/devtools/javascript/ignore-chrome-extension-scripts/

<br />

### Elements 탭

#### 특정 element 스크린샷 파일 생성

- element 우클릭 -> capture node screenshot
- element의 스크린샷이 생성되어 다운로드됨

<br />

### More tools

- 개발자 도구 -> ESC -> 나오는 console drawer에서 More tools 클릭

  - Performance monitor : CPU, heap size, DOM Nodes 등을 확인할 수 있음.
  - Rendering : redering 관련 여러 기능들을 제공
  - Coverage : 녹화 시 실행되는 코드 커버리지를 볼 수 있다. Per function, Per block 으로 설정가능하다. 빨간색으로 표시된 부분이 unused code

- 그 밖의 다양한 기능들을 커맨드 목록을 통해 사용가능 : CMD + shift + P

- input 포커스 엘리먼트 디버깅 하기
  - CMD + shift + P -> focus 검색 -> Emulate a focused page

---

### 참조

- [What's New in DevTools](https://www.youtube.com/playlist?list=PLNYkxOF6rcIBDSojZWBv4QJNoT4GNYzQD)

- [21+ Browser Dev Tools & Tips You Need To Know](https://www.youtube.com/watch?v=TcTSqhpm80Y)
