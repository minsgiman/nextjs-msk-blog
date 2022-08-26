---
title: display none 요소 animation 적용하기
date: '2022-05-14'
tags: ['css']
draft: false
summary: 'transition으로 애니매이션 적용시 display:none 이 시작설정에 있는 경우, transition 애니매이션이 동작하지 않는다.'
---

### display none인 경우 transition이 안먹히는 이유

transition으로 애니매이션 적용시 display:none 이 시작설정에 있는 경우, transition 애니매이션이 동작하지 않는다. <br />
그 이유는 transition은 요소의 시작상태 -> 종료상태 의 개념으로 동작하는데 display:none 일 경우 렌더 트리에 존재 하지않아서, transition의 시작점이 존재하지 않는 상태기 때문이다. 그래서 시각적으로 transition이 동작되지 않는 것처럼 보이는 것이다.

이를 해결하기 위해서는 display: none 대신에 다음 속성을 사용하는 방법이 있다.

- visibility 이용
- height 또는 max-height 0 이용

그런데 display: none을 사용해야 한다면 transition 대신 animation을 사용하는 방법도 있다. <br />
이는 아래에서 알아본다.

### transition 대신 animation 사용

#### transition VS animation 차이

transition 속성은 요소의 상태가 변해야 애니메이션을 실행한다. <br />
animation 속성은 요소의 모양과 동작을 키프레임 단위로 변경할 수 있다. 키프레임 동작은 재생 횟수, 재생 방향등 여러 애니메이션 속성으로 제어할 수 있다. <br />
transition 속성과 animation 속성의 가장 큰 차이는 transition 속성은 요소의 상태가 바뀌어야 바뀌는 상태를 애니메이션으로 표현하지만, animation 속성은 요소의 상태 변화와 상관 없이 애니메이션을 실행한다. (그렇기 때문에 display: none일 경우 요소의 시작상태가 없더라도 정의한 애니매이션이 동작한다.) <br />

두 속성의 차이에 관한 더 자세한 설명은 [Transitions & Animations](https://learn.shayhowe.com/advanced-html-css/transitions-animations/) 문서를 참고한다.

#### animation으로 modal show hide 구현

먼저 dialog 엘리먼트를 사용하여 modal을 구현한다.

- dialog 엘리먼트의 [showModal](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/showModal)을 사용하면 ::backdrop pseudo-element 와 함께 최상위 레이어에 표시된다. dialog 외부의 상호작용은 차단되고 dialog 외부의 콘텐츠는 비활성 상태로 렌더링된다. <br />
  또한 dialog 엘리먼트에 open attribute를 설정한다.

- dialog 엘리먼트의 [close](https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/close)는 showModal과 반대로 동작한다. <br />
  dialog는 다음과 같이 open이 셋되어 있지 않으면 display: none이 기본으로 설정된다.

```css
dialog:not([open]) {
  display: none;
}
```

그 다음에는 closing 애니매이션이 끝난 후에 dialog를 hide시켜야 하는데 이를 위해, closing animationend 이벤트를 구독하여 closing 애니매이션이 완료된 후에 display: none 으로 만든다.

**[html, css, js 구현]**

```html
<button class="button open-button">open modal</button>

<dialog class="modal" id="modal">
  <h2>An interesting title</h2>
  <p>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum esse nisi, laboriosam illum
    temporibus ipsam?
  </p>
  <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque, quo.</p>
  <button class="button close-button">close modal</button>
</dialog>
```

```js
const modal = document.querySelector('#modal');
const openModal = document.querySelector('.open-button');
const closeModal = document.querySelector('.close-button');

openModal.addEventListener('click', () => {
  modal.showModal();
});

closeModal.addEventListener('click', () => {
  modal.setAttribute('closing', '');

  modal.addEventListener(
    'animationend',
    () => {
      modal.removeAttribute('closing');
      modal.close();
    },
    { once: true }
  );
});
```

```css
.modal::backdrop {
  background: rgb(0 0 0 / 0.5);
  opacity: 0;
}

.modal[open] {
  animation: slide-up 1000ms forwards, fade-in 500ms forwards;
}

.modal[closing] {
  display: block;
  pointer-events: none;
  inset: 0;
  animation: fade-out 500ms forwards;
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes fade-out {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes slide-up {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0%);
  }
}
```

---

### 참고

- [display none이 transition이 안먹히는 이유](https://velog.io/@dev-tinkerbell/display-none%EC%9D%B4-transition%EC%9D%B4-%EC%95%88%EB%A8%B9%ED%9E%88%EB%8A%94-%EC%9D%B4%EC%9C%A0)
- [animate from display none](https://www.youtube.com/watch?v=4prVdA7_6u0)
