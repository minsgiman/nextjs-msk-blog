---
title: Secure Coding 6 - Communication Security
date: '2023-08-16'
tags: ['security', 'frontend', 'backend']
draft: false
summary: '여기서 말하는 통신에는 서버-클라이언트, 서버-데이터베이스 등 모든 백엔드 통신이 포함됩니다. 이들은 데이터의 무결성과 은닉성을 보장하기 위해 암호화된 상태여야 합니다.'
---

### 개요

통신 보안을 생각할 때 개발자는 통신에 이용되는 경로가 안전한지 확인해야 합니다.

여기서 말하는 통신에는 서버-클라이언트, 서버-데이터베이스 등 모든 백엔드 통신이 포함됩니다. 이들은 데이터의 무결성과 은닉성을 보장하기 위해 암호화된 상태여야 합니다.

이 항에서는 통신 보안에서 조심해야 할 점 등을 함께 설명합니다.

### SSL/TLS

SSL/TLS는 2개의 암호 프로토콜로 안전하지 않은 통신 경로를 암호화할 수 있습니다. SSL/TLS의 가장 일반적인 사용 예는 HTTPS입니다.

TLS는 SSL의 후계에 해당하지만, "SSL", "SSL/TLS", "TLS"는 종종 같은 의미로 쓰여 "SSL"이라고 표기해도 실질적으로는 TLS를 가리키는 경우도 많습니다.

TLS가 올바르게 구현되어 있으면 다음과 같은 이점이 있습니다.

* 은닉성: 공격자는 트래픽 내용을 훔쳐볼 수 없음
* 완전성: 공격자는 트래픽을 조작할 수 없음
* 재전송 공격 방지: 공격자가 서버에 캡처한 요청을 재발송할 수 없음
* 인증: 통신 중인 곳이 진짜 서버임을 클라이언트가 검사할 수 있음

로그인 페이지와 같이 기밀성 높은 정보를 다루는 부분뿐만 아니라 모든 페이지와 엔드포인트에서 TLS를 이용해야 합니다. <br />
TLS 통신이 강제 적용되지 않은 페이지가 있을 경우 세션 토큰을 훔치거나 악의적인 JavaScript를 응답에 포함시킬 수 있는 기회를 공격자에게 주게 됩니다.

### HTTP Strict Transport Security header

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

[HSTS(HTTP Strict Transport Security)](https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Strict-Transport-Security)는 웹 애플리케이션이 특별한 응답 헤더를 반환하면 사용할 수 있는 보안 강화 기능입니다.

이 기능을 지원하는 브라우저가 헤더를 받은 경우 **지정된 도메인에 대한 HTTP 통신을 거부하고 대신 모든 통신을 HTTPS에서 실행합니다.**

* **max-age=\<expire-time\>**: 이 기간 내에는 HTTPS만으로 사이트에 접속하도록 브라우저 캐시에 저장합니다.
* **includeSubDomains**: 사이트의 모든 하위 도메인에도 HSTS를 적용합니다.

### HTTP Headers

실전 환경에서는 모든 불필요한 기능이나 파일은 삭제되어야 합니다. 테스트 코드나 디버깅 기능은 최종 버전에는 필요하지 않습니다. <br />
**HTTP 응답 헤더도 마찬가지로 확인해야 합니다. 다음과 같은 공격자에게 유용한 정보를 주는 헤더는 삭제해야 합니다.**

* OS version
* Web server version
* Framework or Programming language version

또한 웹 애플리케이션 보안을 향상시키는 HTTP 헤더를 설정하는 것도 중요합니다. <br />
다음의 Security Headers 를 참고합니다.
* https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html

--- 

### 참고

* https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html#server-configuration