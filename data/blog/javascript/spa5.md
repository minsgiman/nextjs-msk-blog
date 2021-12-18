---
title: MVW framework없이 Single Page App 만들기 5
date: '2020-11-11'
tags: ['javascript', 'frontend']
draft: false,
summary: '다국어 지원'
---

## 다국어 지원

- 다국어 지원을 위하여 jquery.li18n 라이브러리를 사용하였다.

- jquery.li18n에 단어별 ID를 등록하고 사용한다.

```js
$.li18n.translations = {
  eng: {
    strId_login: 'Login',
    strId_logout: 'Logout',
  },
  kr: {
    strId_login: '로그인',
    strId_logout: '로그아웃',
  },
}
$.li18n.currentLocale = 'eng'

/* _t('strId_login') or $.li18n.translate('strId_login')로 사용 */
```
