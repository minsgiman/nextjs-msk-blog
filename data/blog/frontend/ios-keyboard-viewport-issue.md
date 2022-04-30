---
title: IOS 12, 13 에서 Keyboard가 사라질 때 viewport가 다시 내려오지 않는 문제 대응하기
date: '2021-05-14'
tags: ['frontend', 'webview']
draft: false
summary: 'IOS 12에서 Input focus시 Keyboard가 나오면서 viewport를 위로 올린후에, input blur되면 Keyboard가 사라지면서 viewport가 원래 위치로 내려와야 하는데, 내려오지 않는 문제가 있다.'
---

## 이슈

IOS 12에서 Input focus시 Keyboard가 나오면서 viewport를 위로 올린후에, input blur되면 Keyboard가 사라지면서 viewport가 원래 위치로 내려와야 하는데, 내려오지 않는 문제가 있다.

찾아보니, IOS 12, 13에서 발생하는 WKWebview 이슈다. (IOS 13.4부터는 수정되어 발생하지 않음) <br />
https://openradar.appspot.com/radar?id=5018321736957952

## Keyboard Show, Hide 감지

웹뷰의 근본문제를 수정할수는 없어서, JS에서 우회방법으로 해결해야 한다. <br />
그러기 위해서는 우선 Keyboard가 나타나고 사라지는 타이밍을 감지할 수 있어야 한다. <br />
기존에는 resize 이벤트를 감지하여 viewport 크기 변경을 체크하여 키보드가 Show, Hide 되었는지 판단하고 있었다. <br />

```js
const handler = () => {
  const { height: oldHeight } = viewportSize
  const { height: newHeight } = getViewPortSize()
  const isVisible = oldHeight !== newHeight

  handleSendMessage({
    type: RESPONSE_KEYBOARD_VISIBLE_STATE,
    data: {
      isVisible,
    },
  })
}

window.addEventListener('resize', handler)
```

AOS 웹뷰에서는 위의 코드가 잘 동작한다. 그런데 IOS 웹뷰에서는 resize이벤트가 발생하지 않는다! <br />
그 이유는 Keyboard를 보여주기 위해 viewport를 다루는 방법이 다르기 때문이다. <br />

### AOS 웹뷰에서 뷰포트 사이즈 조절

먼저 AOS 웹뷰에서는 keyboard가 보여질 때 keyboard가 차지하는 영역만큼 layout viewport 크기를 줄이고 (resize이벤트 발생), 페이지를 리렌더링 시킨다. <br />

### IOS 웹뷰에서 스크롤

IOS에서는 8.2버전부터 Safari, 웹뷰에서 keyboard를 보여줄 때 부드러운 효과를 내기 위해서 viewport를 resize시키는 방법을 사용하지 않는다. <br />
대신 **layout viewport위에 keyboard를 보여주기 위한 또 다른 Layer를 만들고 keyboard가 보여질 때는 keyboard 영역만큼 layout viewport를 위로 scroll시키는 방법을 사용한다.** <br />
**그래서 resize이벤트는 발생하지 않고, 대신에 scroll이벤트가 발생하게 된다.**

<img src="/static/images/ios-keyboard-show.gif" />

그런데 위에서 보고된 이슈에서는 keyboard가 나올때만 scroll이벤트가 발생하고, 사라질 때는 viewport를 다시 원래대로 내려주지 않기 때문에 scroll이벤트도 감지할 수 없었다. <br />
결국은 resize, scroll 이벤트로는 keyboard가 사라진 타이밍을 알 수가 없었고 keyboard를 띄울 때 포커스된 input의 blur 이벤트를 통해서 판단하게 되었다.

## 이슈 수정

다음과 같이 input blur시에 돌아오지 않은 스크롤 위치를 다시 원래대로 돌리는 방법으로 문제를 수정하였다. <br />

```js
const handler = () => {
  window.scrollTo(0,NaN)
};
input.addEventListener('blur', handler});
```

이 방법은 잘 알려진 workaround 방법이나, <br />
위의 방법을 적용하기 위해서 왜 IOS 웹뷰에서는 키보드가 나타나고 사라질 때 resize가 발생하지 않고, scrollTo를 사용해야 하는지 조사해보게 되었다.

## 참고

- https://openradar.appspot.com/radar?id=5018321736957952
- https://github.com/apache/cordova-ios/issues/417
- https://blog.opendigerati.com/the-eccentric-ways-of-ios-safari-with-the-keyboard-b5aa3f34228d
