---
title: OWASP Top 10 (2017)
date: '2018-03-05'
tags: ['security']
draft: false
summary: 'OWASP(국제 웹 보안 표준기구, The Open Web Application Security Project)에서는 3년에서 4년마다 웹 어플리케이션 취약점 중 가장 영향력있고 위협적인 취약점 10개를 선정하여 발표한다.'
---

OWASP(국제 웹 보안 표준기구, The Open Web Application Security Project)에서는 3년에서 4년마다 웹 어플리케이션 취약점 중 가장 영향력있고 위협적인 취약점 10개를 선정하여 발표한다.

다음은 2017년에 발표한 10대 Web Application 취약점이다.

1. Injection(인젝션)
2. Broken Authentication and Session Management(인증 및 세션 관리 취약점)
3. Cross-Site Scripting (XSS) (크로스 사이트 스크립팅)
4. Broken Access Control (취약한 접근 제어)
5. Security Misconfiguration (보안 설정 오류)
6. Sensitive Data Exposure (민감 데이터 노출)
7. Insufficient Attack Protection (불충분한 공격 보호)
8. Cross-Site Request Forgery (CSRF) (크로스 사이트 요청 변조)
9. Using Components with Known Vulnerabilities (알려진 취약점이 있는 컴포넌트 사용)
10. Underprotected APIs (보호되지 않은 API)

### Injection(인젝션)

- SQL, OS, XXE, LDAP 인젝션 등이 존재
- 데이터 명령이나 쿼리문의 일부분이 인터프리터로 보내질 때 발생
- 공격자가 악의적인 데이터 구문을 이용해 명령을 실행하거나 적절한 권한없이 비정상적으로 데이터에 접근하는 공격
- **이에 대응하기 위해 사용자 입력 창에 일부 특수문자 입력 차단, SQL 서버 에러 메시지 표시 금지, 일반사용자 권한으로 시스템저장 프로시저 접근 차단 하는 등의 방법이 필요**

### Broken Authentication and Session Management(인증 및 세션 관리 취약점)

- 인증이나 세션 관리 어플리케이션 기능이 잘못 구현되어 공격자에게 취약한 암호, 키 또는 세션 토큰을 제공
- 다른 사용자의 권한을 일시 또는 영구적으로 얻게 되는 취약점

### Cross-Site Scripting (XSS) (크로스 사이트 스크립팅)

- 신뢰할 수 없는 데이터가 응용 프로그램의 새 웹 페이지에 포함되거나 사용자가 제공한 데이터로 JavaScript 작성 기능이 있는 브라우저 API를 사용하여 기존의 웹 페이지가 업데이트될 때 발생하는 취약점
- 침입자는 이 방법을 통해서 브라우저에 스크립트를 삽입하고 실행할 수 있다.
- 공격자가 희생자의 브라우저 사용자 세션을 도용하거나, 웹 사이트를 변조시키거나, 악성 사이트로 리다이렉션 시킴
- **이에 대응하기 위해 사용자가 문자열에 스크립트 입력을 막기 위해 \<, \>, \&, ” 등을 문자변환함수나 메소드를 이용하여 &lt, &gt, &am p, &quot 로 치환해야 한다.**
- **또한, HTML 태그를 허용하는 게시판의 경우에는 화이트리스트를 선정하여 해당 태그만 입력 가능하도록 설정해야 한다.**

### Broken Access Control (취약한 접근 제어)

- 인증된 사용자가 수행할 수 있는 작업에 대한 제한이 원활하게 적용되지 않음
- 공격자는 해당 결함을 악용하여 다른 사용자의 계정에 액세스하거나, 중요한 파일을 보고, 다른 사용자의 데이터를 수정 또는 삭제
- UI 에서 보여지는 특정기능을 수행하기 전에, 기능 접근 제한 권한을 검증해야 하지만 적절하게 미수행될 경우, 공격자는 비인가된 기능에 접근하기 위해 정상적 요청을 변조한다.

### Security Misconfiguration (보안 설정 오류)

- 바람직한 보안은 어플리케이션, 프레임워크, WAS, 웹 서버, DB 서버 및 플랫폼에 대한 보안 설정
- 설정을 정의, 구현 및 유지하며, 소프트웨어를 최신 버전으로 관리하지 않아 발생하는 취약점

### Sensitive Data Exposure (민감 데이터 노출)

- 공격자가 신용 카드, 신분 도용 또는 다른 범죄를 수행하는 취약한 데이터를 훔치거나 변경할 수 있는 취약점
- 브라우저내에서 중요 데이터를 저장 또는 전송할 때, 노출되어 발생하는 취약점
- 이를 보완하려면 데이터 저장 시 암호화 및 데이터 전송 시에도 SSL 등을 이용해야 한다.

### Insufficient Attack Protection (불충분한 공격 보호)

- 대부분의 어플리케이션 및 API는 수동 공격과 자동 공격을 모두 탐지, 방지 및 대응할 수 있는 기능이 없음
- 기본 입력 유효성 검사를 훨씬 뛰어넘어 자동 탐지, 로깅, 응답 및 공격 시도 차단을 원활하게 하지 않아 발생되는 취약점

### Cross-Site Request Forgery (CSRF) (크로스 사이트 요청 변조)

- 로그인된 피해자의 취약한 웹 어플리케이션에 피해자의 세션 쿠키와 기타 다른 인증 정보를 자동으로 포함해, 위조된 HTTP 요청
- 해당 악의적인 요청을 Client의 권한을 이용하여 정상적인 요청처럼 보내 서버를 공격

### Using Components with Known Vulnerabilities (알려진 취약점이 있는 컴포넌트 사용)

- 컴포넌트, 라이브러리, 프레임워크 및 다른 소프트웨어 모듈은 어플리케이션과 같은 권한으로 실행
- 취약한 컴포넌트들을 악용하여 심각한 데이터 손실을 발생시키거나 서버를 장악함
- 알려진 취약점이 있는 컴포넌트를 사용하는 어플리케이션과 API는 어플리케이션을 악화시킬 뿐만 아니라, 다양한 공격에 영향을 줄 수 있다.

### Underprotected APIs (보호되지 않은 API)

- 최근 애플리케이션은 API(SOAP/XML, REST/JSON, RPG, GWT)에 연결되는 브라우저 및 모바일 애플리케이션의 Javascript 와 같은 Rich Client Application과 API를 포함하는 경우가 많음.
- 이러한 API는 대부분 보호되지 않으며 수많은 취약점을 포함
- 이 문제를 완화하기 위해서는, 클라이언트와 API 사이의 통신이 보호되고 있는지 확인해야 하며, API에 강력한 인증방식이 모든 인증정보, 키 및 토큰을 보호하고 있는지 확인해야 한다.
