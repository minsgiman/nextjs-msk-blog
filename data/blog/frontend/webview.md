---
title: Webview 사용에 대한 내용 
date: '2023-12-24'
tags: ['frontend', 'mobile']
draft: false
summary: '웹뷰를 쓰는 이유, 앱과 웹이 통신하는 방법 등 정리'
---

## 웹뷰를 쓰는 이유

#### 장점

1. 웹페이지 구현 하나로 IOS, AOS, Mobile 브라우저, Desktop 브라우저 들을 대응할 수 있음.
2. 빠른 업데이트 - App 의 경우 심사 부터 사용자가 업데이트 하기까지 많은 시간이 소요됨. 웹뷰에서는 이런 과정없이 배포하면 바로 반영됨
3. 네이티브 기능 - 웹뷰에서는 App 개발자와 사전에 정의한 인터페이스를 통해 네이티브 기능을 사용할 수도 있음 

#### 단점

1. Native에 비해 성능이 느림
2. 보안 이슈를 가지고 있음
3. 사용자 경험 - 애플과 구글의 새로운 OS에서 제공하는 Mobile Native 기능을 웹뷰에서 활용 못하여 사용자가 OS를 업데이트 하였음에도 단절된 사용자 경험.

#### 슈퍼앱도 웹뷰를 사용 (장점 >>>> 단점)

1. 다양한 기능을 하나로 - 모바일 앱 서비스가 점점 커질수록 모바일 앱 크기도 커지고, IOS AOS 모두 개발 비용이 커지기 때문에 이를 극복하고자 웹뷰를 사용
2. 빠른 실험 - 작은 변화, 피드백들을 빠르게 반영

## App 개발자를 위한 레시피

* Javascript로 웹 표준함수 오버라이딩을 통해 네이티브에서 기능을 추가할 수 있다.
  * 웹 콘솔 로그를 네이티브로 가져오기.
  * history.back에 네이티브에서 기능 추가하기  

<img src="/static/images/javascript-override.png" width="600" />


## 웹뷰에 이런 일이?

* cookie 제한 이상으로 사용하면 웹뷰가 열리지 않을 수 있다.

    <img src="/static/images/cookie-limits.png" width="600" />

* 웹 엔진에서 임의의 캐시를 진행함. 

    <img src="/static/images/webview-cache.png" width="600" />


## 앱과 웹이 통신하는 방법 

### Web to App

AppScheme 또는 Javascript Interface 로 호출

<img src="/static/images/scheme-interface.png" width="600" />

* AppScheme은 길이제한이 있음.
* location.href 에 scheme을 설정하여 호출하는 경우 연속으로 호출하면 앞의 호출은 무시되기 때문에 delay를 주고 호출 필요

```ts
/***
 * 딜레이를 통한 스킴 호출 구현 코드
 ***/
function makeSchemeQueue(): SchemeQueue {
  const INTERVAL = 500;
  const queue = [];
  let isConsuming = false;

  function call(): void {
    isConsuming = true;
    const scheme = queue[0];

    if (scheme) {
      window.location.href = scheme;
      queue.shift();
      logging('SSE Debug: Call scheme ', getParamStrLogs(scheme), ', remain scheme: ', getParamStrLogs(queue));
    }

    setTimeout((): void => {
      if (queue.length === 0) {
        isConsuming = false;
        return;
      }
      call();
    }, INTERVAL);
  }

  function queuing(scheme: string): void {
    queue.push(scheme);

    if (!isConsuming) {
      call();
    }
  }

  return {
    queuing,
  };
}
const schemeQueue = makeSchemeQueue();

function callScheme(type: string, id: string, payload?: any): void {
  const { userId } = getContext();

  const schemeQuery = qs.stringify({
    userId,
    ...(id ? { id } : {}),
    ...(payload ? { payload } : {}),
  });
  const scheme = `xxx://test/features/${type}?${schemeQuery}`;

  schemeQueue.queuing(scheme);
}
```

native에 콜백함수명을 전달하고 native에서 이를 실행하도록 정의하면 xss 위험이 있을수 있으므로, 사용을 지양한다.

<img src="/static/images/interface-xss.png" width="600" />

파라미터는 key-value 로 정의하는게 좋다. 그렇지 않으면 파라미터가 추가될 때마다 유지보수가 어려워진다.

<img src="/static/images/key-value-param.png" width="600" />

### App to Web

네이티브에서 Web의 전역함수를 호출하는 방법 대신 `dispatchEvent`를 활용한다. 웹에서는 `window.addEventListener` 로 응답을 전달받음

<img src="/static/images/web-app-interface.png" width="600" />

참고로 App -> Web 호출하는 호출 스크립트의 return 타입에 Promise 를 주면 에러가 발생한다. Primitive 타입 or Object 만 가능하다.

### IOS에서의 심사 Reject 사유

Web의 Native API 호출에 대해 App에서 다이렉트로 web에 response를 주는 방식이 Apple 심사에서 아래와 같이 reject 사유가 되었었다.
  * https://developer.apple.com/app-store/review/guidelines/#third-party-software
  * WebKit 및 JavaScript Core를 사용해 타사 소프트웨어를 실행하며, 타사 소프트웨어로 기본 플랫폼 API를 확장하거나 공개하려고 시도하지 않아야 합니다. 
     * Apple 입장에서는 App이 third-party software 이기 때문에 가이드라인 상 WebKit and JavaScript Core를 이용해서 APP API를 사용하는 것은 reject 사유.

이를 우회하기 위한 방법으로 Web에서 App Scheme을 호출하고, 응답이 필요하면 중간에 SSE 서버를 두고 SSE 통신 으로 받도록 우회하게 되었다.
  * Web →(API 호출) App →(Response 전달) SSE Server →(Response 전달) Web

---

### 참조

- [모두의 웹뷰](https://www.youtube.com/watch?v=LbU5E1pWfks)
