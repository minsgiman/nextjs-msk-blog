---
title: Secure Coding 1 - Input Validation
date: '2023-08-11'
tags: ['security', 'frontend', 'backend']
draft: false
summary: '웹 애플리케이션 보안의 관점에서 말하면 사용자 입력이나 그와 관련된 데이터를 확인하지 않고 이용하는 것은 그 자체로 보안에 위협이 됩니다.'
---

[OWASP 보안 코딩 관행 - 빠른 참조 가이드](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/) 의 다음 항목들에 따라 더 안전한 웹 애플리케이션을 구현하는 데 갖춰야 할 기본적인 사고방식이나 구현 예 등을 소개합니다.

1. Input Validation
2. Output Encoding
3. Authentication and Password Management
4. Session Management
5. Access Control
6. Cryptographic Practices
7. Error Handling and Logging
8. Data Protection
9. Communication Security
10. System Configuration
11. Database Security
12. File Management
13. General Coding Practices

<br />

## Input Validation

### 개요

웹 애플리케이션 보안의 관점에서 말하면 사용자 입력이나 그와 관련된 데이터를 확인하지 않고 이용하는 것은 그 자체로 보안에 위협이 됩니다. 

이 문제에 대처하기 위해 **입력 유효성 검사나 입력 삭제를 활용**합니다. 애플리케이션에서 사용자 데이터를 다규칙 경우 받은 데이터는 기본적으로 위험한 것으로 취급되어야 하며 적절한 보안 검사 후에만 입력으로 받아야 합니다.

사용자 입력 이외의 데이터 소스도 제공 데이터가 신뢰할 수 있는지 여부를 판단한 후 이용되어야 합니다. 신뢰할 수 없는 소스의 데이터는 사용자 입력과 마찬가지로 유효성 검사를 실시해야 합니다.

중요한 점은 **모든 유효성 검사를 신뢰할 수 있는 시스템에서 실시해야 한다는 점입니다. 즉 클라이언트 측에서 실시하는 유효성 검사는 보안 관점에서 보면 의미가 없으며 서버에서 실시되어야 합니다.**

<br />

### 입력 유효성 검사 목적

입력 유효성 검사는 시스템 간 데이터가 적절한 형식임을 보장하고 잘못된 형식의 데이터가 데이터베이스에 저장되거나 하위 구성요소의 오작동을 방지하기 위해 실행됩니다. 

**입력 유효성 검사는 가능한 한 상위 데이터 흐름에서 이루어져야 하며 가능한 경우 외부에서 데이터를 받은 후 즉시 이루어져야 합니다.**

<br />

### 입력 유효성 검사 방법

입력 유효성 검사 방법으로는 다음 두 가지가 있습니다.

* 구문(Syntactical) 기반 검사: 데이터가 구문 상 올바른지 여부(예: SSN, 날짜, 통화 기호)
* 의미(Semantic) 기반 검사: 특정 컨텍스트에서 값이 올바른지 여부(예: 시작일이 종료일 이전인지 여부, 가격은 의도한 범위 내에 있는지 여부)

<br />

### 입력 유효성 검사 구현 예

* 데이터형 검사는 여러 웹 애플리케이션 프레임워크에 구현되고 있음(예: Django Validators, Apache Commons Validators 등)
* JSON Schema나 XML Schema (XSD)검사
* 엄격한 오류 처리가 이루어지는 형변환 (예: Integer.parseInt() in Java, int() in Python)
* 수치나 날짜의 최소값, 최대값, 문자열 길이의 하한 및 상한
* 허용된 문자열 선택지 목록(예: 요일)
* 기타 구조화된 데이터에 대해 입력 문자열 전체를 지원하는 정규 표현 ( ^...$ ) 을 이용하여 임의의 문자를 나타내는 와일드 카드를 이용하지 않음

#### Allow list vs block list

위험할지 모르는 문자( 예: ' )나 입력 패턴( 예: 1=1, \<script\> )을 탐지하기 위해 차단 목록을 사용하는 것은 흔히 일어나는 실수입니다. 대부분 공격자가 쉽게 우회할 수 있습니다.

**허용 목록에 따른 검증은 사용자 입력 검증에 적합합니다.** 허용 목록은 무엇이 허용되는지 정의하고 기타 모든 것을 거부합니다.

날짜나 우편번호와 같이 적절하게 구조화된 데이터의 경우 주로 정규 표현을 이용하여 매우 강력한 검증 패턴을 정의할 수 있습니다.

```
Date:               ^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$
Zip code:           ^[0-9]{3}-[0-9]{4}$
E-mail address:     ^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$
```

또한 드롭다운 목록이나 라디오 버튼과 같이 입력에 고정 선택지가 있는 경우 선택지 중 하나에 정확하게 일치하는지 확인합니다.

```
List<String> allowList = Arrays.asList("Apple", "Orange", "Peach");
if (!allowList.contains(userInput)){
    // reject
}
```

#### Validating free-form Unicode text

특히 유니코드가 포함된 자유 형식 텍스트를 검증하는 것은 어렵습니다.

또한 이것이 어렵다는 점을 통해 컨텍스트에 기반한 [출력 인코딩](https://docs.oracle.com/cloud/latest/related-docs/OMCEZ/ko/OutputEncodingRequiredFields.htm)의 중요성을 알 수 있으며, 입력 유효성 검사를 XSS나 SQL 삽입 등의 공격을 막기 위한 주요 방법으로 사용하지 말아야 할 이유 중 하나입니다.

출력 인코딩을 사용하여 XSS(교차 사이트 스크립팅)를 막을 수 있는데 `$outputencoding()$(HTML)` 및 `$outputjsencoding()$(JavaScript)`와 같이 HTML, javascript 등을 출력하기 전에 인코딩함으로써 XSS를 막을 수 있습니다.

**입력 유효성 검사와 출력 인코딩을 적절히 조합함으로써 XSS로부터 안전한 애플리케이션을 구현할 수 있습니다.**

#### Regular expressions

정규표현식 검증 패턴 예 : [OWASP Validation Regex Repository](https://owasp.org/www-community/OWASP_Validation_Regex_Repository)

정규 표현 설계 시 [ReDoS(RegEx 서비스 거부 공격)](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS)에 주의하십시오. 잘못 설계된 정규 표현을 사용할 경우 프로그램 동작이 느려지거나 CPU 리소스가 오랜 시간 사용됩니다.

catastrophic-backtracking 참고 : https://ko.javascript.info/regexp-catastrophic-backtracking

Regex 성능에 문제가 없는지 https://regex101.com/ 에서 테스트해볼 수 있다. 

<br />

### Client Side vs Server Side Validation

**클라이언트 측에서만 수행되는 검증은 쉽게 우회할 수 있습니다. 클라이언트 측에서 이루어지는 검증은 서버 측에서도 동일하게 실시하십시오.**

<br />

### File Upload Validation

자세한 내용은 [파일 업로드 치트 시트](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html) 확인

#### Upload Verification
* 확장자가 있는지 여부
* 파일 크기가 미리 정의한 최대값을 초과하는지 여부
* ZIP 파일의 경우 전개 전에 다음 항목 검사 필요
   * 전개처 경로: ZIP slip attack
   * 압축 레벨: ZIP bomb attack
   * 전개 후 사이즈: ZIPbombattack

#### Upload Storage
* OS에 파일을 저장할 때 새로운 파일명을 생성하십시오. 업로드되는 파일이나 임시 파일의 파일 이름을 사용자가 제어할 수 있는 문자열에서 생성하지 마십시오.
* 웹에 파일을 업로드할 경우 파일명을 변경하는 것이 좋습니다. 아래와 같이 파일명을 경유한 공격을 방지하는 효과가 있습니다.
  ```
  test.jpg;.asp
  
  /../../../../../test.jpg.
  ```
* 파일명을 임의 문자열 등으로 예측할 수 없게 만드는 것은 의도하지 않은 storage 액세스를 막기에는 불충분합니다. 적절한 storage 인증 방법을 마련하십시오.
* 업로드된 파일 경로는 클라이언트 측에서 지정하지 마십시오. 서버 측에서 결정해야 합니다.

#### Public Serving of Uploaded Content
* 올바른 Content-type(예: image/jpeg, appplication/json) 헤더를 부여하십시오.

#### Beware of "special" files
파일 업로드 기능에도 **특정 파일 형식이나 확장자만 허용하는 허용 목록 방식을 사용**해야 합니다. 특히 아래와 같은 특수 파일 형식에 주의하시기 바랍니다.

* **crossdomain.xml / clientaccesspolicy.xml**: Flash, Java, Silverlight에서 교차 도메인 데이터 취득을 허용합니다. CSRF 취약성과 교차 도메인 데이터 절도가 가능할 수 있습니다.
* **.htaccess 및 .htpasswd**: 디렉토리 단위로 서버를 설정하기 위한 파일
* aspx, asp, css, swf, xhtml, rhtml, shtml, jsp, js, pl, php, cgi.와 같은 스크립트 파일

<br />

### Email Address Validation

#### Syntactic Validation

[RFC 5321](https://www.rfc-editor.org/rfc/rfc5321#section-4.1.2)에 정의된 이메일 주소의 형식은 사고방식보다 훨씬 복잡하고 이하도 유효한 주소로 여겨집니다.

```
- "><script>alert(1);</script>"@example.org
- user+subaddress@example.org
- user@[IPv6:2001:db8::1]
- " "@example.org
```

단, 현실에서는 구현에 더 제한된 주소 포맷이 이용되고 있는 경우가 많아 RFC에서 허용되었다고 해서 모든 것이 송신 가능한 주소라고 할 수 없습니다. <br />
그러므로 아래와 같은 기본 검사를 실시한 후 메일 서버로 보내고 메일 서버에서 거부될 경우 오류를 처리하는 것이 좋습니다.
* "@"을 사이에 두고 두 파트로 나눌 수 있음
* 위험한 문자를 포함하지 않음
* 도메인 부분에는 영숫자, 하이픈(-), 마침표(.)만 사용
* 주소 길이
   * 로컬 파트는 63글자 이내
   * 전체 길이는 254글자 이내

#### Semantic Validation

의미 검사는 이메일 주소가 적절한지 확인하는 것입니다. <br />
가장 일반적인 것은 사용자에게 메일을 보내고 메일 내 링크를 클릭하게 하거나 보내온 코드를 입력하게 하는 것입니다. 이 방법으로 증명되는 것은 다음과 같습니다.

* 메일 주소의 정확성
* 그 주소로 메일을 보낼 수 있는지 여부
* 사용자가 메일함에 접속할 수 있는지 여부

또한 메일로 전송되는 토큰은 다음과 같아야 합니다.

* 32글자 이상
* 안전한 난수를 이용하여 생성
* 1회 밖에 사용할 수 없음
* 유효 기간이 있음(예: 1시간 후 만료)

메일 주소의 소유권을 검사한 후 통상적인 인증 방법으로 다시 사용자 인증을 실시합니다.

---

### 참고

* https://cheatsheetseries.owasp.org/cheatsheets/Bean_Validation_Cheat_Sheet.html
* https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
* [OWASP Secure Coding Practices-Quick Reference Guide](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/) 
* [Go programming language secure coding practices guide](https://github.com/OWASP/Go-SCP)
* [JavaScript Web Application Secure Coding Practices](https://checkmarx.gitbooks.io/js-scp/content/) 
* [WebAppSec/Secure Coding Guidelines](https://wiki.mozilla.org/WebAppSec/Secure_Coding_Guidelines) 
* [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/index.html) 

