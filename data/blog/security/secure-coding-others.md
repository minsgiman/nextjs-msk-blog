---
title: Secure Coding - Others
date: '2023-08-19'
tags: ['security', 'frontend', 'backend']
draft: false
summary: '안전한 개발을 위해 일반적으로 조심해야 할 부분을 설명합니다.'
---

안전한 개발을 위해 일반적으로 조심해야 할 부분을 설명합니다.

### Dependencies

각 프로그래밍 언어가 각각의 패키지 관리 툴을 가지고 있어 분할된 재사용 가능 코드를 손쉽게 자신의 애플리케이션에 도입할 수 있게 되었습니다.

이는 OWASP 안전한 코딩 관행에서 추천하는 **"일반적인 작업에는 관리되지 않는 코드를 새로 만들지 말고 테스트를 거쳐 승인된 관리 코드 사용하기"** 에도 부합합니다.

단, 개발자는 서드파티가 개발한 것을 자신의 애플리케이션에 도입할 경우 주의해야 합니다. 개발자는 항상 그 종속성의 안전을 확인해야 합니다.

이들은 이미 애플리케이션의 일부이기 때문에 확인할 의무가 있습니다. 일부 개발자는 패키지 품질을 GitHub의 별점으로 확인합니다. 하지만 이는 큰 의미가 없을 수도 있습니다.

기본적으로 툴을 이용하여 취약한 라이브러리를 발견할 수 있으며 이들을 CI Pipeline에 통합하거나 린터나 테스트 등의 시기에 실행하는 것도 좋습니다.

#### Typo-squatting attack

서드파티 패키지 등을 이용할 때 조심해야 할 공격에는 [타이포스쿼팅 공격(Typo-squatting attack)](https://en.wikipedia.org/wiki/Typosquatting)이 있습니다.

이는 다양한 문자열 오타를 이용한 공격으로, 공격자는 예를 들어 자주 이용되는 패키지의 이름을 한 글자 바꾸거나 삭제한 패키지 이름으로 악의적인 코드를 등록합니다. 그러면 오타가 있는 사용자의 컴퓨터 등에서 코드를 실행할 수 있습니다.

실제로 Python의 패키지 매니저인 PyPi나 Node.js의 npm에는 이러한 공격을 시도하는 패키지가 발견되었습니다. <br />
https://snyk.io/blog/typosquatting-attacks/

타이포스쿼팅 공격은 엄밀히 따지면 패키지 이름뿐만 아니라 다양한 컨텍스트의 오타를 이용한 공격입니다. (example.com -> exampe.com)

<br />

### Interpreted Code Integrity

OWASP 보안 코딩 관행은 **"체크섬 또는 해시를 사용하여 해석된 코드, 라이브러리, 실행 파일, 구성 파일의 무결성 확인"** 을 권장하고 있습니다.

예를 들어 JavaScript 라이브러리 등의 외부 리소스를 CDN에서 다운로드하여 이용하려 할 때 그 리소스가 침해되었거나 변조되었을 경우 어떻게 될까요?

클라이언트에서 다운로드된 자체 애플리케이션이 우리가 원하던 것이라는 점은 어떻게 확인하면 좋을까요?

이때 [SRI(Subresource Integrity)](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)가 유용합니다.

이전에는 클라이언트 측 애플리케이션이 필요로 하는 스크립트를 추가할 때 SRI가 아무런 보증 없이 구현되었습니다.

```html
<script src="https://example.com/example-framework.js"></script>
```

**SRI가 있는 지금은 리소스 다운로드뿐만 아니라 실행 또한 지정한 해시 값과 일치하는 경우만 실행하도록 브라우저에 지시할 수 있습니다.**

**즉 브라우저가 스크립트 실행 전에 해시 값을 확인하기 때문에 리소스가 조작된 것인지 탐지할 수 있습니다.**

```html
<script src="https://example.com/example-framework.js"
        integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
        crossorigin="anonymous"></script>
```

이것은 \<link\> 요소로도 이용할 수 있습니다.

<br />

### Concurrency

공유 리소스는 교착 상태나 리소스 고갈과 같은 병행 처리 문제를 일으킵니다. <br />
이러한 문제를 해결하기 위한 기술은 이미 알려져 있으며 세마포어와 뮤텍스 두 가지입니다.

아래 예는 데이터베이스가 동시 접속과 조작의 대상이 되는 공유 리소스임을 상기시킵니다. <br />
보통 데이터베이스의 동시 실행을 다룰 필요가 없지만 파일 시스템의 읽기/쓰기 조작이나 하나의 파일을 조작하는 경우 조심해야 합니다.

```js
const express = require('express');
const fs = require('fs');
const path = require('path');
 
const app = express();
const file = path.resolve('./counter.txt');
 
const counterMiddleware = (req, res, next) => {
  fs.readFile(file, (err, data) => {
    if (!err) {
      let counter = +data.toString();
      counter++;
 
      fs.writeFile(file, counter, (err) => {
        next();
      });
    }
 
    next();
  });
};
```

이 예에서는 counter.txt라는 하나의 파일을 데이터 저장처로 사용하고 있으며 요청 시마다 읽기와 쓰기가 이루어집니다.

Express 서버는 여러 요청에 동시에 응답하기 때문에 요청이 많이 올 경우 두 요청이 동시에 파일에 액세스하려고 하거나 쓰기 조작이 예상 순서대로 진행되지 않을 수 있습니다.

<br />

### Cross Domain

#### Preventing CSRF

CSRF 공격이란 최종 사용자에게 인증된 웹 애플리케이션에서 원치 않는 조작을 유발할 수 있는 공격입니다.

이를 막을 수 있는 방법으로 CSRF 토큰을 사용할 수 있습니다. CSRF 토큰은 아래와 같은 특징을 가집니다. 양식의 숨김 필드에 넣거나 (GET 요청으로 상태 변경 조작이 있을 경우) URL에도 부여합니다.

* 상태 변경을 조작하는 요청은 CSRF 토큰 필요
* 특징
  * 사용자별, 사용자 세션별로 고유함
  * 1개의 사용자 세션과 연결
  * 큰 임의 값
  * 암호학적 난수 생성기(Secure Random)에서 생성
* CSRF 토큰 검사 실패 시 요청 실패

```html
<form method="post" action="https://somedomain.com/user/signin" autocomplete="off">
    <input type="hidden" name="csrf" value="CSRF-TOKEN" />
 
    <label>Username <input type="text" name="username" /></label>
    <label>Password <input type="password" name="password" /></label>
 
    <input type="submit" value="Submit" />
</form>
```

참고: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html

#### Preventing Malicious Site Framing (Click jacking)

클릭잭킹은 페이지를 겹쳐 놓거나 프레임을 이용하여 사용자가 특정 부분을 클릭하게 하거나 데이터를 입력하게 하는 공격입니다.

X-Frame-Option 헤더를 모든 HTML 콘텐츠의 응답으로 설정하면 자신의 사이트를 표시할 수 있는 프레임을 제한하는 것이 가능합니다. 헤더가 취할 수 있는 값은 아래 2개입니다.

* DENY: 모든 사이트에서 콘텐츠를 프레임에 표시할 수 없도록 거부
* SAMEORIGIN: 같은 원본 내에서만 프레임에 표시할 수 있도록 허용
  
특별한 경우가 아니면 "DENY"가 좋습니다.

#### Cross-Origin Resource Sharing (CORS) Setting

웹 브라우저는 스크립트로 시작되는 교차 원본 HTTP 요청을 제한합니다. 단, 예를 들어 프론트 엔드와 API 서버가 다른 도메인인 경우 등 이러한 교차 원본 요청을 허용하고 싶은 경우가 있습니다.

이러한 경우 CORS를 이용하여 모든 또는 특정 원본에서 리소스에 액세스하는 것을 허용할 수 있습니다. 단, 부적절하게 설정하면 애플리케이션이 위험에 노출될 수 있습니다.

CORS 관련 상세 정보: https://developer.mozilla.org/ja/docs/Web/HTTP/CORS

아래와 같은 두 가지 경우 주의해야 합니다.

1. Access-Control-Allow-Origin: *

    `Access-Control-Allow-Origin` 헤더에 `*`를 지정한 경우 모든 사이트에서 요청을 허용한다는 뜻입니다.

    예를 들어 인증 없는 CDN 등으로 설정되는 경우 많은데 인증 있는 사이트에서 `Access-Control-Allow-Credentials: true`와 동시에 설정하면 다른 사이트에서 CSRF로 인해 정보 절도가 일어나는 등 위험이 있습니다.

2. Access-Control-Allow-Origin 동적 생성

    POST 요청이나 CORS 요청 시 해당 요청처 원본을 서버로 전달하기 위해 웹 브라우저가 자동으로 부여하는 헤더가 `Origin`입니다.

    `Access-Control-Allow-Origin`헤더를 동적으로 생성하는 경우, 즉 HTTP 요청에 포함된 Origin 헤더에서 그 요청원을 허용할지 판단하는 경우 Origin 헤더 값 확인에 주의해야 합니다.

    Origin 헤더 값은 전방만 일치가 아닌 완전히 일치하는지 확인하십시오

    ```
    allowOrigin = 'https://example.com'
    allowOrigins = ['https://example.com']
     
    // bad
    'https://example.com.evil.com'.match(allowOrigin) // -> match!
     
    // bad
    'https://example.com.evil.com'.startsWith(allowOrigin) // -> true
     
    // bad
    'https://example.com.evil.com'.includes(allowOrigin) // -> true
     
    // ok
    'https://example.com.evil.com' == allowOrigin // -> false
    'https://example.com' == allowOrigin // -> true
     
    // ok
    allowOrigins.includes('https://example.com.evil.com') // -> false
    allowOrigins.includes('https://example.com') // -> true
    ```

    이쪽도 마찬가지로 인증 있는 사이트에서 `Access-Control-Allow-Credentials: true`와 동시에 설정하면 다른 사이트에서 CSRF로 인해 정보 절도가 일어나는 등의 위험이 있습니다.

<br />

### Evaluation function

몇몇 프로그래밍 언어는 문자열 등을 프로그램으로 평가하는(실행하는) 함수를 갖고 있습니다.

* JavaScript : [eval](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/eval)
* PHP: eval
* Python: eval, exec
* Ruby: eval

그러한 함수에 사용자 입력을 넣는 행위는 임의 코드 실행 시 취약점이 발생할 가능성이 높아 매우 위험합니다.


