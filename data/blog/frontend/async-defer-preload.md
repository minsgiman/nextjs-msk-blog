---
title: preload 적용 관련 참고내용
date: '2022-06-25'
tags: ['frontend', 'performance']
draft: false
summary: 'preload를 통한 페이지 로딩 속도 개선'
---

### [preload를 통한 페이지 로딩 속도 개선 (script, style, font, image)](https://web.dev/i18n/ko/preload-critical-assets/)

preload 사용방법과 이를 통해 중요한 리소스를 미리 요청하여 어떻게 페이지 로딩 속도를 개선하는지 설명한다. <br />

### [우선순위 힌트로 리소스 로딩 최적화하기](https://ui.toast.com/weekly-pick/ko_2021117)

리소스를 로드할때 브라우저가 기본적으로 Priority를 할당하는데, 모든 경우에 최선의 선택을 하진 않는다. <br />
그래서 Web Vital을 최적화하기 위해 importance 속성을 통해 우선순위 힌트(Priority Hints)를 설정하는 방법에 대해 설명한다. (with preload) <br />

### [Don't fight the browser preload scanner](https://web.dev/preload-scanner/)

브라우저의 primary HTML parser가 blocked되었을때 (blocking resource로 인해) 보조 parser인 preload scanner가 동작하여 어떻게 리소스를 발견하고 빠르게 로드하는지 설명한다. <br />

### [Preload, Prefetch And Priorities in Chrome](https://medium.com/reloading/preload-prefetch-and-priorities-in-chrome-776165961bbf)

Preload를 통한 로딩 개선과정을 자세히 설명하고 Prefetch와 비교한다. <br />

### [Faster page rendering with async, defer and preload](https://www.codementor.io/@gauravdgr81codementor/faster-page-rendering-with-async-defer-and-preload-1he43g72v5)

일반 script 로드, 실행과 비교하여 async, defer, preload 가 어떻게 동작하는지 설명한다. <br />

### [chrome script load priority](https://docs.google.com/document/d/16rHWLu-0abC9WWLhLBFlIRtbSnOFzhKAXsCamsp0oAs)

chrome에서 우선순위에 따른 script 스케쥴링을 어떻게 하는지에 대한 표

---

### preload, defer 비교

- html 파싱을 block하지 않고 리소스를 요청하며 html파싱이 완료된 후에 script 실행은 defer, preload 모두 동일함
- 단 기본적으로 preload가 높은 우선순위 (High)로 네트워크 요청을 하기 때문에 critical 리소스인 초기번들에 적용하기에는 preload가 적절함

#### defer와 preload 동작 비교

다음과 같이 정의 하였을때,

```html
<head>
  <script src="src/index.js"></script>
  <script src="src/defer.js" defer></script>
  <link rel="preload" href="src/preload.js" as="script" />
</head>
```

defer가 Low priority라서 network queue 에 먼저 들어가도 다른 우선순위 높은 요청이 완료된 후에 가져오기 시작함
<img src="/static/images/preload-defer.png" />

실행순서는 정의한 순서대로 index -> defer -> preload
