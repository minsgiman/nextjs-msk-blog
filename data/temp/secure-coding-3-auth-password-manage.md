---
title: Secure Coding 3 - Authentication and Password Management
date: '2023-08-13'
tags: ['security', 'frontend', 'backend']
draft: false
summary: '인증과 비밀번호 관리는 모든 시스템에서 매우 중요하며 사용자 로그인부터 자격 증명 보관 방법, 비밀번호 재설정, 프라이빗 리소스 액세스 등도 포함합니다.'
---

### 개요

인증과 비밀번호 관리는 모든 시스템에서 매우 중요하며 사용자 로그인부터 자격 증명 보관 방법, 비밀번호 재설정, 프라이빗 리소스 액세스 등도 포함합니다.

이 항에서는 인증과 비밀번호 관리의 사고방식과 구현 방법 등을 함께 설명합니다.

### 기본 규칙

**'모든 인증은 신뢰할 수 있는 시스템에서 실시해야 한다'는 것이 기본 규칙입니다. 즉 기본적으로 백엔드 서버에서 이루어진다는 것을 의미합니다.**

인증 시스템을 가능한 한 독자적으로 구현하지 마십시오. **일반적으로 프레임워크에는 인증용 모듈이 있습니다. 이는 많은 사람이 개발, 보수, 사용하고 있으며 일원화된 인증 메커니즘으로 기능하기 때문에 이러한 모듈을 이용하는 것이 좋습니다.**

단, 개발자는 그 코드가 모든 악의적인 코드에도 영향을 받지 않는지 신중하게 확인하고 보안 모범 사례에 따라 개발되고 있는지 확인해야 합니다.

인증은 애플리케이션 사용자만을 위한 것이 아니라 민감한 정보나 기능을 포함한 외부 시스템에 접속하는 경우도 필요합니다.

이 경우 인증 정보는 암호화되어 신뢰할 수 있는 시스템의 보호된 장소에 저장되어야 합니다.

<br />

### Communicating Authentication Data

#### HTTP GET vs POST

**인증 자격 증명이 송신되는 것은 HTTP POST 요청뿐이어야 하며 암호화되어 있는 통신(HTTPS)이어야 합니다.**

TLS/SSL로 암호화된 HTTP GET 요청도 POST 요청과 마찬가지로 안전해 보일 수 있지만 일반적인 HTTP 서버에서 요청 URL은 액세스 로그에 기록되기 때문에 안전하지 않다는 점에 주의하십시오. 브라우저 이력에 기록되는 경우도 있습니다.

HTTPS라도 URL은 외부에 노출되거나 기록될 가능성이 있기 때문에 민감한 정보를 포함해서는 안 됩니다.

<img src="/static/images/get-access-log.png" />

#### Authentication Error

**애플리케이션에서는 인증 오류 처리 시 인증 데이터의 어떤 부분이 잘못되었는지 알려주어서는 안 됩니다.**

즉 "사용자 이름이 잘못되었습니다"나 "비밀번호가 잘못되었습니다"가 아니라 "사용자 이름이나 비밀번호, 또는 둘 다 잘못되었습니다"라고 표시해야 합니다.

<br />

### Validation and Storing Authentication Data

#### Hashing vs Encryption

민감한 정보 저장 시 일반적으로 해시화와 암호화가 사용됩니다. 그러나 대부분 **비밀번호는 암호화가 아닌 해시화되어야** 합니다.

**해시화는 일방 함수**로 해시화된 것을 "해독"해서 원래 값을 알 수 없습니다. 공격자가 해시화된 비밀번호를 얻었다고 해도 원래 비밀번호를 알 수 없습니다.

한편 **암호화는 키를 아는 사람이라면 암호화된 것을 해독하여 원래 값을 알 수 있습니다. 암호화는 사용자의 주소 등 암호를 해독하여 원래 정보를 이용해야 하는 데이터에 사용**해야 합니다.

**비밀번호 보관이라는 컨텍스트는 제출된 비밀번호가 올바른 비밀번호와 같은지를 확인할 수 있으면 됩니다. 올바른 비밀번호가 무엇인지는 중요하지 않기 때문에 해시화가 적절**합니다.

#### Storing password securely: The practice

암호화에는 "never roll your own crypto(자신의 암호기를 굴리지 말라)" 라는 말이 있습니다. 즉 스스로 비밀번호를 구현하지 말라는 것입니다. 

바퀴의 재발명을 시도할 것이 아니라 전문가가 검토하고 승인한 알고리즘이나 툴을 이용해야 합니다.

[OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#password-hashing-algorithms)에서는 비밀번호 보관에 아래와 같은 비밀번호 해시 알고리즘을 권장합니다.

* Argon2
* bcrypt
* scrypt
* PDKDF2

<br />

### Implement Proper Password Strength Controls

인증에 비밀번호 사용 시 주요 우려사항은 비밀번호의 강도입니다. 강력한 비밀번호 정책을 이용하여 비밀번호 예상을 어렵게/불가능하게 만들 수 있습니다.

* 비밀번호 길이
  * 비밀번호의 최단 길이는 애플리케이션에서 강제 적용해야 하며, 8자 이하의 길이는 일반적으로 취약함 ([NIST SP800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html))
  * 최장 비밀번호 길이는 낮게 설정되어서는 안 되며, 특정 비밀번호 해시 알고리즘의 입력 최댓값은 일반적으로 64자로 이를 설정하는 것은 [긴 비밀번호 서비스 거부 공격](https://www.acunetix.com/vulnerabilities/web/long-password-denial-of-service/)을 방지하는 데 중요함
* 서비스 측에서 마음대로 비밀번호를 줄일 수 없음
* 유니코드나 공백문자를 포함한 모든 문자를 허용해야 하며, 문자의 종류를 제한하는 규칙은 없어야 함
* 비밀번호 유출 시 비밀번호 재설정 가능
* 비밀번호 강도 측정 툴을 이용하여 사용자가 강력한 비밀번호를 작성하거나 이미 유출된 비밀번호를 차단할 수 있도록 지원
  * [zxcvbn-ts library](https://github.com/zxcvbn-ts/zxcvbn)
  * [Pwned Passwords](https://haveibeenpwned.com/Passwords)


---

### 참고

* [Authentication Cheat Sheet | OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
* [Password Storage Cheat Sheet | OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)





