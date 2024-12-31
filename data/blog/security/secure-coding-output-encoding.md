---
title: Secure Coding - Output Encoding
date: '2023-08-12'
tags: ['security', 'frontend', 'backend']
draft: false
summary: '컨텍스트에 기반해 적절하게 출력 인코딩이 이루어지지 않으면 XSS나 SQL 삽입의 공격이 발생합니다. 출력 인코딩으로 이에 대한 대책을 알아봅니다.'
---

### 개요

웹 애플리케이션의 기능이 많아지고 복잡해지면서 사용자, 데이터베이스, 서드파티 등 데이터 소스가 많아지는 경향이 있습니다. <br />
그리고 원하는 때 취득한 데이터는 특정 컨텍스트를 가진 미디어(예: 웹 브라우저)로 출력됩니다. <br />
이때 컨텍스트에 기반해 적절하게 출력 인코딩이 이루어지지 않으면 XSS나 SQL 삽입의 공격이 발생합니다. 출력 인코딩으로 이에 대한 대책을 알아봅니다.

<br />

### Cross-Site Scripting (XSS)

XSS 취약성은 웹 애플리케이션에서 가장 자주 발생하는 취약성 중 하나로 공격자가 사용자의 브라우저에서 악의적인 Javascript 코드를 실행하게 만드는 공격이 가능하게 합니다. 이로 인해 계정 탈취와 정보 절도가 발생합니다.

일반적으로 XSS는 Reflected XSS, Personal (Stored) XSS, DOM based XSS 세 종류로 분류될 수 있습니다. 여기서는 편의상 XSS를 아래 두 가지로 분류합니다.

* **서버 XSS**: 서버에서 생성되는 HTML 응답에 신뢰할 수 없는 데이터가 포함되어 발생하는 XSS
* **클라이언트 XSS**: 위험한 Javascript 실행으로 신뢰할 수 없는 데이터가 DOM 업데이트에 사용되어 발생하는 XSS

#### Server XSS

서버 XSS는 앞서 말했듯 서버에서 생성되는 HTML 응답에 신뢰할 수 없는 데이터가 포함되어 발생하는 XSS입니다. <br />
예를 들어 검색 화면에서 test라는 문자열을 검색하려는 경우 아래와 같은 GET 요청을 한다고 가정합니다.

```
https://example.com/search?q=test
```

서버는 쿼리 매개변수 q 값(test)을 꺼내 DB 등을 검색하고 그 결과를 클라이언트에 반환합니다. <br />
검색 조건에 일치하는 결과가 없는 경우 아래와 같이 표시됩니다.

```
No results found for "test"
```

이러한 서버를 Node.js의 웹 프레임워크인 Express에서 (보안을 전혀 사고방식하지 않고) 구현한 경우 다음과 같아집니다.

```js
const express = require('express');
const db = require('../lib/db');
const router = express.Router();
 
router.get('/search', (req, res) => {
  const results = db.search(req.query.q);
 
  if (results.length === 0) {
    return res.send('<p>No results found for "' + req.query.q + '"</p>');
  }
 
  // ...
});
```

"test" 키워드를 입력해도 문제가 발생하지 않았는데 `<script>alert('XSS')</script>`를 검색하면 어떻게 될까요?

```
https://example.com/search?q=<script>alert('XSS')</script>
```

조건에 일치하는 결과가 없다면 서버의 응답은 다음과 같습니다.

```
<p>No results found for "<script>alert('XSS')</script>"</p>
```

브라우저가 이 응답을 수신하고 전달한 후에 이러한 alert가 표시됩니다.

<img src="/static/images/XSS.png" width="400" />

이는 alert('XSS')라는 Java Script가 실행된 결과로 이 부분을 다시 작성하여 URL을 공유하면 다른 사용자의 브라우저에서 임의의 Java Script 코드를 실행할 수 있게 됩니다.

이 예에서는 사용자 입력을 GET 요청의 쿼리 매개변수에서 받았습니다. 물론 POST 요청 등 다른 메서드에서 받는 패턴이나 DB에 있는 데이터나 다른 API에서 가져오는 데이터를 출력하는 패턴에서도 마찬가지로 발생합니다.

#### Client XSS

클라이언트 XSS는 위험한 Javascript 실행으로 신뢰할 수 없는 데이터가 DOM 업데이트에 사용되어 발생하는 XSS입니다.

**Javascript 내 HTML 콘텐츠를 직접 렌더링하는 메서드와 속성에는 몇 가지가 있는데 이들이 신뢰할 수 없는 데이터와 함께 이용되는 것이 원인입니다.**

예)
```javascript
// Attributeselement.innerHTML = "<HTML> Tags and markup";
element.outerHTML = '<script>alert("XSS")</script>';
// Methods
document.write('<script>alert("XSS")</script>');
document.writeln('<script>alert("XSS")</script>');
```

또한 최근에는 프론트 엔드 개발에 React나 Vue 등 JavaScript 프레임워크가 이용될 때가 많은데 여기에도 위의 DOM을 직접 업데이트할 수 있는 기능이 있습니다. 여기에도 마찬가지로 주의해야 합니다.

```javascript
// React
<p dangerouslySetInnerHTML={{__html: message}}></p>
 
// Vue.js
<p v-html="message"></p>
```

<br />

### XSS 대책

앞서 말했듯 **출력되는 컨텍스트에 따른 출력 인코딩(Output Encoding)을 실행**하는 것이 중요합니다.

#### HTML Contexts

```html
<div> INJECTION </div>
// Example attack
<div> <script>alert(1)</script> </div> 
```

HTML 컨텍스트(HTML 태그 사이 등)에 문자열을 전개하는 경우 그것이 HTML로 해석되지 않도록 HTML 엔터티를 인코딩하십시오.

| Before | After    |
|--------|----------|
| &      | `&amp;`  |
| \<     | `&lt;`   |
| \>     | `&gt;`   |
| \"     | `&quot;` |
| \'     | `&#x27;` |

또한 HTML 업데이트에 JavaScript를 사용하고 있는 경우 [.textContent](https://developer.mozilla.org/ko/docs/Web/API/Node/textContent) 속성을 이용하여 자동으로 유사하게 인코딩해줍니다.

#### HTML Attribute Contexts

HTML 속성 컨텍스트(HTML 태그 속성값 내)에 문자열을 전개하는 경우에도 HTML 엔터티를 인코딩해야 합니다.

또 다른 속성 컨텍스트로 변경되는 것을 방지하려면 속성값을 반드시 \" 또는 \'로 둘러싸야 합니다.

<img src="/static/images/XSS_eg3.png" />

또한 아래와 같이 eventHandler 등의 일부 속성에 사용자 입력을 직접 넣는 것 자체가 XSS로 연결됩니다. [안전한 속성](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#safe-sinks) 이외에 사용자 입력을 전달하지 마십시오.

```javascript
//event handler
<button onclick="callback(INJECTION)">click</button>

// href 
<a href="INJECTION">click</a>
<a href="javascript:alert(1)">click</a>
```

#### JavaScript Contexts

<img src="/static/images/XSS_eg5.png" />

**JavaScript 컨텍스트에 문자열을 전개할 때 안전한 곳은 따옴표로 둘러싸인 문자열 부분이고, 그 안에서도 영숫자 이외의 문자는 유니코드 이스케이프해야 합니다.**

따옴표로 둘러싸인 문자열 부분 예)

<img src="/static/images/XSS_eg6.png" />

유니코드 이스케이프 예)

| Before | After    |
|--------|----------|
| \<     | `\u003c` |
| \>     | `\u003e` |

그리고 JSON의 경우 XSS를 방지하려면 Content-type 헤더가 `text/html`가 아닌 `application/json`여야 합니다.

#### URL Contexts

URL 안에 문자열을 전개할 경우 URL을 인코딩하십시오.

<img src="/static/images/XSS_eg7.png" />

<img src="/static/images/XSS_eg8.png" />

또한 JS나 CSS 컨텍스트와 마찬가지로 속성(href)은 따옴표에 둘러싸여 있어야 합니다.

#### HTML Sanitization

CMS 기능을 구현하는 경우 사용자가 입력한 HTML을 HTML로 전개해야 하는 경우가 있습니다. 단 사용자가 입력한 HTML을 그대로 출력할 경우 XSS 취약성이 쉽게 발생합니다.

이러한 요건을 충족하기 위해 HTML 인코딩이 불가능한 경우에도 XSS를 방지하는 방법이 있습니다.

프로필에 링크를 붙이거나 문자 장식을 하거나 사용자가 어느 정도 자유롭게 HTML을 입력하게 한 후 그것을 웹 애플리케이션에 표시하게 하고 싶지만 XSS는 방지하려는 경우를 생각해봅니다.

이하 HTML이 주어진 경우

```html
<h1> XXX's Profile </h1>

<img src="x" onerror="alert('XSS!!')" alt="profilepic">

<a href="javascript:alert('XSSSSS!!')">this is my blog</a>
```

아래와 같이 위험 요소가 제거된 것으로 변환할 수 있다면 XSS를 방지할 수 있습니다.

```html
<h1> XXX's Profile </h1>

<img alt="profilepic" src="x">

<a>this is my blog</a>
```

이러한 변환은 HTML 무해화라고 하며 [DOMPurify](https://github.com/cure53/DOMPurify)나 [sanitize-html](https://www.npmjs.com/package/sanitize-html)등 라이브러리가 많이 이용됩니다. <br />
이러한 라이브러리는 요소나 속성의 허용 목록을 정의하고 거기에 포함되지 않는 것은 삭제하는 방식입니다.

#### 프레임워크 등의 적절한 이용

현대적인 웹 애플리케이션 프레임워크는 개발자를 좋은 보안 관행으로 이끌고 템플릿 생성과 자동 이스케이프와 같은 기능 등으로 XSS 발생을 줄입니다.

따라서 이를 이용해 개발된 애플리케이션에서는 XSS 발생이 감소하고 있습니다.

단, 개발자는 이러한 프레임워크에도, 예를 들어 다음과 같은 안전하지 않은 이용 방법이 있다는 점을 염두하고 적절하게 이용해야 합니다.

* 직접 DOM을 갱신할 수 있는 기능 이용
* 무해화되지 않은 HTML을 React의 dangerouslySetInnerHTML이나 Vue의 v-html에 사용
* 유효성 검사 javascript:, data: URL 이용
* Angular의 bypassSecurityTrustAs* 함수
* 템플릿 삽입
* 옛 버전의 프레임워크, 구성요소 이용

요건에 따라 프레임워크를 통한 방어가 되지 않는 부분을 구현해야 하는 경우 출력 인코딩이나 HTML 삭제가 유용합니다.

<br />

### SQL injection

<img src="/static/images/SQL_eg1.png" />

MySQL 등 SQL 데이터베이스가 이용되고 있는 경우 사용자 입력을 조작하여 임의의 SQL 쿼리를 실행할 수 있는 취약성을 SQL 삽입이라고 합니다.

예를 들면 아래와 같은 사용자 메일 주소를 가져오도록 처리했다고 가정합니다.

```
String query = "SELECT email FROM users WHERE id=" + id
Statement statement = connection.createStatement();
ResultSet resultSet = statement.executeQuery(query); // executing raw query
```

변수 ID에 아래를 입력하면

```
1 UNION SELECT group_concat(table_name) FROM information_schema.tables WHERE table_name = database()
```

데이터베이스 내 테이블 이름을 모두 가져올 수 있습니다.

<br />

### SQL injection 대책

**SQL 삽입을 방지하기 위해서는 프리페어드 스테이트먼트와 입력 검증을 적절히 조합할 필요가 있습니다.**

#### 프리페어드 스테이트먼트 이용

앞 장에서 설명한 입력 유효성 검사를 적절하게 실시하는 것만으로도 SQL 삽입의 영향을 줄일 수 있지만 이는 SQL 삽입의 완벽한 대책은 아닙니다.

SQL 삽입 대책으로 프리페어드 스테이트먼트를 이용하십시오.

```
String query = "SELECT email FROM users WHERE id=?";
PreparedStatement　statement = connection.prepareStatement(query);  // precompile query
statement.setInt(1, id); // bind variable
ResultSet resultSet = statement.executeQuery();
```

프리페어드 스테이트먼트는 SQL 쿼리를 사전 컴파일하여 데이터와 쿼리를 분리하는 것으로 SQL 쿼리 다시 쓰가를 불가능하게 하는 기능입니다. 사전 컴파일된 쿼리는 재사용도 가능하기 때문에 효율적이기도 합니다.

#### 허용 목록을 통한 입력 유효성 검사

또한 사용자의 입력이 고정 선택지에서 선택되는 경우 허용 목록 방식으로 입력 유효성 검사를 실시할 수 있습니다.

```
String query = "some SQL ... order by id " + (sortOrder ? "ASC" : "DESC");`
```

#### 프레임워크 등의 적절한 이용

안전하게 SQL 데이터베이스를 이용하려면 XSS와 마찬가지로 개발자는 프레임워크가 어떻게 SQL 쿼리를 만들고 실행하는지 이해하고 이용해야 합니다.

예를 들어 사내에서는 MyBatis가 많이 사용되고 있습니다.

이 때 아래와 같이 `#{}`을 이용할 경우 프리페어드 스테이트먼트를 이용하여 쿼리가 실행되기 때문에 SQL 삽입에 안전합니다.

특별한 이유가 없다면 `#{}`만을 이용해야 합니다. (`${}`를 이용하는 경우 이는 단순한 문자열 연결로 쿼리가 만들어지므로 SQL 삽입에 취약합니다.)

```
@Mapper
public interface UserMapper {
    @Select("select * from user where name = #{name}")
    User findByName(@Param("name") String name);
}
```












