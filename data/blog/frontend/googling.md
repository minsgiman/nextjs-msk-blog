---
title: 구글링 잘하기
date: '2018-03-24'
tags: ['google']
draft: false
summary: 'exac match, exclude, SITE:URL, BEFORE:DATE, AFTER:DATE'
---

#### exac match

따옴표 안의 내용과 일치하는 검색결과를 우선하여 찾아준다.

```
docker "mysql exited with code 137"
```

```
"be of the web"
```

<br />

#### exclude

특정 키워드를 검색 결과에서 제외시킨다.
아래 예제에서 php 키워드가 포함된 검색결과는 제외하고 보여준다.

```
store javascript date object in mysql -php
```

<br />

#### SITE:URL

특정 웹사이트 내에서의 검색결과를 보여준다.

```
site:stackoverflow.com detect click outside element
```

<br />

#### BEFORE:DATE, AFTER:DATE

```
site:stackoverflow.com CSS center a div vertically after:2020
2020년도 이후에 퍼블리싱된 검색결과를 보여준다.
```

```
site:stackoverflow.com CSS center a div vertically before:2010
2010년도 이전에 퍼블리싱된 검색결과를 보여준다.
```

---

### 참조

- [How to search on Google](https://support.google.com/websearch/answer/134479?hl=en)
