---
title: error stack을 통해 호출한 함수이름 가져오기
date: '2022-12-03'
tags: ['javascript']
draft: false,
summary: 'Error.prototype.stack을 통해 호출한 함수이름을 찾을 수 있다.'
---

[Error.prototype.stack](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack)을 통해 호출한 함수이름을 찾을 수 있다. <br />
다만 브라우저마다 출력방식이 다르고, 브라우저가 업데이트되면서 구현이 변경될 수 있는 점은 고려해야 한다.

```js
function getCallerName(error: Error) {
  const callerStack = error.stack?.split('\n') || [];
  let caller;

  if (DeviceUtility.isAndroid()) {
    caller = callerStack[2]?.trim()?.split(' ')?.[1];
  } else {
    // Safari on iOS
    caller = callerStack[1]?.replace(/@/g, '');
  }

  if (ObjectUtility.isEmptyString(caller) || caller === 'eval') {
    return 'anonymous';
  }

  return caller;
}

function Logger() {
  const caller = getCallerName(new Error());
  console.log('caller : ', caller);
}

function FuncA() {
  Logger();
}

function FuncB() {
  Logger();
}

FuncA(); // caller : FuncA
FuncB(); // caller : FuncB
```
