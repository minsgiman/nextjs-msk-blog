---
title: Javascript 코딩 컨벤션
date: '2021-06-02'
tags: ['javascript']
draft: false,
summary: 'Javascript 코딩 컨벤션을 정리하였다.'
---

## 들여쓰기

`mandatory`

tab을 사용하지 않고, space 2개를 사용한다.

## 문장 종료

`mandatory`

문장 종료시에 세미콜론(;)을 붙인다.

## Naming 컨벤션

`mandatory`

변수, 함수 이름 : camelCase

```js
const transferType = type

function convertTransfer() {
  // ...
}
```

클래스 이름, React 컴포넌트 : PascalCase

```js
class RequestInfoMsgRoute {
  // ...
}
```

상수, enum 이름 : UPPER_CASE_SNAKE_CASE

```js
const NEW_TYPE = 'newtype'
```

boolean 변수 : `is-` 또는 `has-` prefix를 붙인다.

```js
// is prefix to describe a characteristic
const isLoggedIn = true
const isActiveUser = true

// has prefix if it possesses a certain value
const hasFollowers = true
const hasAllergies = false
```

function Naming은 동사로 시작한다. 주로 사용하는 동사 : get, set, reset, fetch, remove, delete, handle

```js
// reset a value
function resetCount() {
  this.count = this.initialCount
}

// remove an element
function removeItemFromCart(itemId) {
  return this.items.filter((item) => item.id !== itemId)
}

// erase permanently
function deleteComment(blogId, commentId) {
  // delete from DB
}
```

## 변수 선언

`mandatory`

const는 let보다 위에 선언한다. <br />
const와 let은 사용하는 블럭의 가장 위에 선언해준다.

```js
function sample() {
  const result = []
  let pageToken = null

  for (let i = 0; i < cnt; i++) {
    let id = null

    // ...
  }

  // ...
}
```

## 함수

#### 1. 콜백함수

`mandatory`

콜백함수는 함수 표현식 대신 화살표 함수를 사용한다. <br />
화살표 함수의 파라미터 부분 괄호는 생략하지 않는다.

```js
// bad
items.map(function (item) {
  return item + 1
})
```

```js
// good
items.map((item) => {
  return item + 1
})
```

#### 2. object 파라미터

`optional`

파라미터가 object인 경우에는 destructuring 사용을 권장한다. <br />
object 파라미터를 그대로 넘기거나 하는 경우와 같이 destructuring이 필요 없는 경우에는 예외로 한다.

```js
// bad
const getTransferResult = (receiver) => {
  console.log(receiver.receiverType, receiver.receiverName)

  return `${receiver.receiverType} ${receiver.receiverName}`
}
```

```js
// good
const getTransferResult = ({ receiverType, receiverName }) => {
  console.log(receiverType, receiverName)

  return `${receiverType} ${receiverName}`
}
```

#### 3. const vs function 선언

`optional`

function 선언은 모듈내의 메인 기능을 표현할 때 사용한다. (대부분 export의 대상이 될 것이다.) <br />
그 외에는 const arrow function 으로 표현하는 것을 권장한다.

```js
// good
export function Counter() {
  const onIncrease = () => {
    dispatch({ type: 'INCREMENT' })
  }

  const onDecrease = () => {
    dispatch({ type: 'DECREMENT' })
  }

  return (
    <div>
      <button onClick={onIncrease}>+1</button>
      <button onClick={onDecrease}>-1</button>
    </div>
  )
}
```

```js
// good
export function convertStringToArrayBuffer(str) {
  // ...
}
```

```js
// bad
export const isObject = () => {
  // ...
}
```

#### 4. boolean flag 파라미터

`optional`

boolean flag 파라미터를 전달하는 것을 지양하고, 함수 분리가 가능하다면 분리한다.

```js
// bad
function getItemCost(itemCost, isMember) {
  const MEMBER_DISCOUNT = 0.3
  const NORMAL_DISCOUNT = 0.1
  let cost

  if (isMember) {
    cost = itemCost * (1 - MEMBER_DISCOUNT)
  } else {
    cost = itemCost * (1 - NORMAL_DISCOUNT)
  }
  return cost
}
```

```js
// good
function getItemCost(itemCost) {
  const NORMAL_DISCOUNT = 0.1
  const cost = itemCost * (1 - MEMBER_DISCOUNT)
  return cost
}
function getItemCostForMember(itemCost) {
  const MEMBER_DISCOUNT = 0.3
  const cost = itemCost * (1 - MEMBER_DISCOUNT)
  return cost
}
```

## 블록구문

`mandatory`

가독성을 위해 if, for, while 문의 한 줄짜리 블록인 경우에도 {}를 생략하지 않으며, brace 사이는 줄 바꿈한다.

```js
// bad
if (termData?.term?.downloadable)
  return { type: FOOTER_TYPE.DOWNLOAD, onDownloadClick: handleDownloadClick }
```

```js
// good
if (termData?.term?.downloadable) {
  return {
    type: FOOTER_TYPE.DOWNLOAD,
    onDownloadClick: handleDownloadClick,
  }
}
```

## 타입 체크

`mandatory`

타입 체크 Util(TypeUtility)을 미리 정의하고 이를 사용한다. <br />
typescript를 사용할때 타입 체크 유틸 함수에 Type Guard를 설정 할 수도 있다.

```js
// bad
if (typeof message === 'string') {
  // ...
}
```

```js
// good
import { TypeUtility } from '@utils'
// TypeUtility.isBoolean
// TypeUtility.isString
// TypeUtility.isObject
// TypeUtility.isElement

if (TypeUtility.isString(message)) {
  // ...
}
```

## 유효성 체크

`mandatory`

유효성 체크 Util(ObjectUtility)을 미리 정의하고 이를 사용한다.

```js
// bad
if (obj === null || obj === undefined) {
  // ...
}
```

```js
// good
import { ObjectUtility } from '@utils';
// ObjectUtility.isNull
// ObjectUtility.isUndefined
// ObjectUtility.isNullOrUndefined
// ObjectUtility.isEmptyString
// ObjectUtility.isEmpty
// ObjectUtility.isEmptyFunction

if (ObjectUtility.isNullOrUndefined(obj) {
  // ...
}
```

## 조건문 Encapsulation

`optional`

조건문을 함수로 제공하여 함수명을 통해 이해하기 쉽게하고 재사용할 수 있도록 한다.

```js
// bad
if (status === 'loading' && isEmpty(productList)) {
  // ... rest of the code
}
```

```js
// good
function shouldDisplayLoader(status, productList) {
  return status === 'loading' && isEmpty(productList)
}
if (shouldDisplayLoader(requestStatus, productList)) {
  // ... rest of the code
}
```

## 이벤트 핸들러 Naming

`mandatory`

이벤트 핸들러 Naming은 기본적으로는 "handle-" prefix를 사용하고, 이벤트 핸들러 props의 이름은 "on-" prefix를 사용한다.

```js
const AmountInputBox = ({ receiver, onInputClick, onSelectAccountChange, children }) => {
  // ...

  const handleInputClick = (e) => {
    e.preventDefault()
    onInputClick()
  }

  const handleSelectAccountChange = (value) => {
    onClose()
    onSelectAccountChange(value)
  }

  return (
    <>
      <InputTransferAmount value={amount} onClick={handleInputClick} />

      {children}

      <TransferAccountLayer onChange={handleSelectAccountChange} />
    </>
  )
}

AmountInputBox.defaultProps = {
  receiver: {},
  onInputClick: () => {},
  onSelectAccountChange: () => {},
  children: null,
}

AmountInputBox.propTypes = {
  receiver: PropTypes.object,
  onInputClick: PropTypes.func,
  onSelectAccountChange: PropTypes.func,
  children: PropTypes.node,
}

export default AmountInputBox
```

## File Naming

`mandatory`

기본적으로 camelCase를 사용하되, React 컴포넌트 또는 Class를 export 하는 경우에는 PascalCase를 사용한다.

```cmd
accountType.ts
Button.tsx (React 컴포넌트)
RouteStrategy.js (RouteStrategy 클래스)
```

## 로깅

`mandatory`

직접 console.log를 호출하지 않고, logger 유틸을 정의하고 이를 사용한다.

```js
// bad
console.log('[SendMessage target]', message)
```

```js
// good
import { logger } from '@utils'

logger.trace('[SendMessage target]', message)
```

```cmd
( 로그 레벨에 따른 logger 유틸 함수)
logger.trace
logger.debug
logger.info
logger.warn
logger.error
```

`optional`

try catch 문에서 런타임 중에 발생하지 말아야 하는 exception인 경우, logger.error를 통해 로깅한다. (첫 번째 파라미터는 error 객체) <br />
logger 유틸내에서 error 로그는 [Sentry](https://sentry.io/welcome/)와 같은 error tracking 시스템으로 전송하도록 처리한다.

```js
try {
  const eventData = JSON.parse(data)

  if (origin === registedOrigin) {
    logger.debug('Received Message', eventData)
    this.callbackList.forEach((v) => v(eventData))
  } else {
    throw 'Invalid origin'
  }
} catch (error) {
  logger.error(error, `[Message from Frame]: ${data}`)
}
```

## es모듈

#### 1. import 경로

`mandatory`

- import 경로는 alias(절대 경로)를 기본으로 사용하고, 동일 디렉토리 / 하위 디렉토리에 한해서만 상대경로를 허용한다.

```js
// bad
import i18n from './../utils/i18n'
```

```js
// good
import { i18n } from '@utils'
import { rootStoryCategory, subStoryCategory, pageStoryCategory } from './utils/constants'
import { StoryLayout } from './decorators'
```

#### 2. named default export

`mandatory`

같은 모듈안에서 named export와 default export를 혼용해서 사용하지 않는다.

```js
// bad
export { Foo, Bar }
export default { User }
```

```js
// good
export { Foo, Bar, User }
```

#### 3. 패키지화되어 있는 모듈 import

`optional`

진입점 역할을 하는 index.js 를 통해 import 하는 것을 지향한다. (index.js를 통해 외부에 공개할 기능을 정리할 수 있다.)

```js
// bad
import { getTransactionList } from '@utils/account/transaction'
```

```js
// good
import { AccountUtility } from '@utils';

AccountUtility.getTransactionList( ... )
```

`mandatory`

단! 패키지안에서 내부 모듈끼리 접근할 때는 패키지 진입점 index.js로 접근하지 말고 반드시 direct로 접근해야 한다. <br />
내부 모듈끼리 접근할 때 패키지 index로 접근하게 되면 다음과 같은 순환 참조 에러가 발생한다.

```cmd
ERROR in Circular dependency detected:
src/utils/locale/i18n.ts -> src/utils/index.ts -> src/utils/locale/index.ts -> src/utils/locale/i18n.ts
```

```js
// bad
// utils/locale/i18n.ts
import { logger, DevUtility, fx } from '@utils'
```

```js
// good
// utils/locale/i18n.ts
import { logger } from '@utils/logger'
import { fx } from '@utils/fx'
import * as DevUtility from '@utils/dev'
```

#### 4. 외부 내부 모듈 구분

`mandatory`

외부 모듈과 내부 모듈 선언 사이에 공백을 두어 구분한다.

```js
// bad
import React from 'react'
import { i18n } from '@utils'
```

```js
// good
import React from 'react'

import { i18n } from '@utils'
```
