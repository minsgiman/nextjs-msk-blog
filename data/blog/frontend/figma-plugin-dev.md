---
title: figma plugin 개발하기
date: '2024-10-13'
tags: ['frontend', 'figma']
draft: false
summary: 'Figma Plugin 으로 할 수 있는 것들, How Plugins Run, Figma Plugin 만들어보기'
---

## Figma Plugin 으로 할 수 있는 것들

#### access the figma document

* figma document 에 접근하여 read, write 모두 가능하다.
    * 단, dev mode plugin 인은 write 는 불가능

#### work with components

* [createComponent](https://www.figma.com/plugin-docs/api/properties/figma-createcomponent/)
* [createInstance](https://www.figma.com/plugin-docs/api/ComponentNode/#createinstance)

#### show plugin UI

* plugin UI 를 제공하고, 사용자와 상호작용 가능
    * [showUI](https://www.figma.com/plugin-docs/api/properties/figma-showui/)

#### make API call

* API call 제약사항
  <img src="/static/images/figma-plugin-cors.png" />

#### Plugin 실행 제약사항

* Can't run multiple plugin
    * 동시에 여러개 플러그인 실행 불가능
    * 백그라운드에서 플러그인 돌리는 것도 불가능
* Can't trigger plugin on events
    * figma document 에서 발생하는 이벤트로 plugin 을 실행 불가능

#### Plugin 샘플

* https://www.figma.com/plugin-docs/textreview-plugins/
    * Checking for spelling mistakes using a REST API
* https://github.com/BuilderIO/figma-html/blob/7fece2560e6ac67814e25c2e6abfadb00211c0e9/plugin/ui.tsx#L62
    * convert figma selected node → JSON using API

## How Plugins Run

* [how plugins run](https://www.figma.com/plugin-docs/how-plugins-run/)
    * [QuickJS](https://github.com/quickjs-ng/quickjs) Javascript engine을 사용하여 WebAssembly 샌드박스 내에서 JavaScript 및 TypeScript 코드를 안전하게 실행할 수 있다.
        * 신뢰할 수 없는 코드를 안전하게 격리하고 실행.  WebAssembly로 컴파일된 가볍고 빠른 QuickJS 엔진을 활용하여 JS 코드 실행을 위한 환경 제공.
        * [Execute JavaScript in a WebAssembly QuickJS Sandbox](https://dev.to/sebastian_wessel/execute-javascript-in-a-webassembly-quickjs-sandbox-14nn)
          <img src="/static/images/figma-plugins-run.png" />

## Figma Plugin 만들어보기

* [Plugin Quickstart Guide](https://www.figma.com/plugin-docs/plugin-quickstart-guide/) 보고 만들기
* mode 에 따른 plugin
    * https://www.figma.com/plugin-docs/setting-editor-type/
        * https://www.figma.com/plugin-docs/working-in-dev-mode/
* plugin document
    * [figma node spec](https://www.figma.com/plugin-docs/api/nodes/)
    * [global objects](https://www.figma.com/plugin-docs/api/global-objects/)
    * [plugin manifest](https://www.figma.com/plugin-docs/manifest/)
* plugin project 만들기
    * https://www.figma.com/plugin-docs/libraries-and-bundling/
    * https://github.com/figma/plugin-samples
      <img src="/static/images/figma-plugin-resource.png" />

--- 

### 참고

* https://www.figma.com/plugin-docs/
* https://www.youtube.com/watch?v=pFGhMr6rDhc
* https://engineering.linecorp.com/ko/blog/create-figma-translation-plugin-with-vuejs