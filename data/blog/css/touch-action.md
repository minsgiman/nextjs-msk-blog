---
title: CSS touch-action 알아보기
date: '2023-07-08'
tags: ['css', 'touch action', 'mobile']
draft: false
summary: 'touch-action 속성을 통해 어떤 요소 내에서 브라우저가 처리할 터치 액션의 목록을 지정할 수 있다.'
---

기본적으로 터치 이벤트의 처리는 브라우저가 담당하는 영역이다. <br />
touch-action 속성을 통해 어떤 요소 내에서 브라우저가 처리할 터치 액션의 목록을 지정할 수 있다. <br />
표준 터치 제스쳐로는 터치를 사용한 스크롤(panning)과 여러 손가락을 사용한 확대/축소(pinch zoom)가 존재한다.

touch-action 속성의 값으로 `auto` 이외의 값을 줄 경우, 해당 속성에 명시해준 터치 액션만이 브라우저에 의해 처리된다다. 예를 들어, `touch-action: pinch-zoom` 속성을 갖는 엘리먼트에서는 터치를 사용한 스크롤이 (자바스크립트로 별도로 처리를 해 주지 않는 이상) 무시된다.

### touch-action 값

1. **auto**

모든 패닝 및 확대 / 축소 제스처의 브라우저 처리를 활성화한다.

```css
.promotion {
    touch-action: auto;         /* 기본 값, 모든 터치 이벤트를 활성화 */
}
```

2. **none**

모든 패닝 및 확대 / 축소 제스처의 브라우저 처리를 비 활성화한다.

```css
.promotion {
    touch-action: none;         /* 기본 값, 모든 터치 이벤트를 비활성화 */
}
```

3. **pan-x, pan-y**

특정 객체를 터치한 후, 수직 혹은 수평 방향으로만 스크롤의 범위를 제한한다.

```css
.promotion{
    touch-action: pan-x;        /* 한 손가락 수평(X축) 이동 제스처만 사용합니다. */
}

.promotion2 {
    touch-action: pan-y;        /* 한 손가락 수직(Y축) 이동 제스처만 사용합니다. */
}
```

4. **pinch-zoom**

여러 손가락을 통한 확대 & 축소 및 이동을 활성화 합니다.

```css
.promotion {
    touch-action: pinch-zoom;       /* 핀치 줌(여러 손가락을 사용한 확대/축소)만 허용 */
}
```

5. **pan-left, pan-right, pan-up, pan-down**

```css
.promotion {
    touch-action: pan-left;         /* 왼쪽 방향으로의 터치를 사용한 스크롤만 허용 */
}
.promotion2 {
    touch-action: pan-right;        /* 오른쪽 방향으로의 터치를 사용한 스크롤만 허용 */
}
.promotion4 {
    touch-action: pan-up;           /* 위쪽 방향으로의 터치를 사용한 스크롤만 허용 */
}
.promotion3 {
    touch-action: pan-down;         /* 아래쪽 방향으로의 터치를 사용한 스크롤만 허용 */
}
```

아래와 같이 여러 옵션을 결합 할 수도 있다.

```css
/* example */
.promotion {
    touch-action: pan-left pan-down;        /* 왼쪽과 아래쪽으로만 끌기 시작할 수 있습니다. */
}
.promotion2 {
    touch-action: pan-x pinch-zoom;         /* 수평방향으로 끌기와 확대/축소 제스쳐만 가능 */
}
.promotion3 {
    touch-action: pan-x pan-y;              /* 수평방향과 수직방향으로만 끌기 가능 */
}
```

6. **manipulation**

패닝 및 핀치 확대 / 축소 제스처를 활성화하지만 **두 번 탭 하여 확대 / 축소하는 것과 같은 추가 비표준 제스처는 비활성화한다.** <br />
manipulation은 `pan-x, pan-y, pinch-zoom` 의 세 속성을 합친 것과 같다. <br />

```css
.promotion{
    touch-action: manipulation; /* 터치를 사용한 스크롤, 핀치 줌만 허용하고 그 외 비표준 동작 (더블 탭으로 확대 등) 불허용 */
}
```

### touch-action 을 통한 더블 탭 오동작 수정

touch-action을 사용하여 IOS에서 double-tab시에 오동작하는 이슈를 수정한 적이 있었다. <br />
하단에 노출된 Web Keypad Layer를 터치하다 보면 double-tab이 동작하면서 뒤의 백그라운드 요소가 스크롤이 되는 이슈였다. <br />

기존의 touch-action 디폴트 값은 auto로 패닝(터치 스크롤) 및 확대 / 축소, 더블탭 제스처 모두 활성화 되어 있었다. <br />
따라서 해당 Keypad Layer에 `touch-action: manipulation` 을 설정함으로써 패닝, 확대, 축소는 활성화하되 더블탭은 비활성화하여 이슈를 수정하였다.

---

### 참조

- [CSS touch-action 한눈에 알아보기](https://wit.nts-corp.com/2021/07/16/6397)
- [mdn touch-action](https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action)
