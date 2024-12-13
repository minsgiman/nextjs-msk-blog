---
title: Truncate Text 구현하기
date: '2024-12-7'
tags: ['frontend', 'javascript']
draft: false
summary: 'CSS로 구현할 수 없는 말줄임 처리를 Javascript로 구현한다.'
---

### CSS 로 말줄임 처리

여러줄 말줄임(ellipsis) 처리시 다음과 같이 CSS를 설정한다.

```css
.wrap {
  overflow: hidden;
  white-space: normal;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
```

```html
<div class="wrap">
    <span>hello world hello world hello world hello world hello world hello world hello world </span>
    <span>hello world hello world</span>
    <img src="https://xxxxx" />
</div>
```

이렇게 설정 하면 앞의 span text 가 길어지면 뒤에 위치한 img 도 함께 말줄임 처리되어 보이지 않게 된다.

<img src="/static/images/truncate1.png" />

### 요구사항 

spanText 말줄임 처리시 spanIcon 은 뒤에 위치하더라도 다음과 같이 항상 보여주어야 한다.

즉, 박스안에서 위치에 따른 icon 영역은 보장한 상태에서 spanText 만 말줄임 처리를 해야 한다.

<img src="/static/images/truncate2.png" />

css 로는 방법이 없어 보인다. javascript 로 처리해야 해야한다.

### Javascript 로 말줄임 처리

Javascript 로 계산하기 위해서 먼저 단순하게 생각해보면 다음과 같은 계산들이 필요할 것 같다.

1. Box 의 width 와 maxHeight 를 구한다.
2. spanText + spanIcon + '...'(말줄임 처리 문자) 를 줄바꿈 적용하여 그렸을 때, Box 의 maxHeight 를 넘어가는지 체크한다.
3. maxHeight 를 넘어간다면, spanText 의 문자열을 어디까지 줄였을 때, Box 의 maxHeight 를 안 넘어가는지 찾는다.

Box 의 maxHeight 를 넘어가는지 어떻게 알 수 있을까?

Box 와 Icon 의 width, height 정보는 이미 알고 있기 때문에, spanText 가 차지하는 영역만 알면 된다. 

단순히 글자 하나의 넓이를 알아내서 `글자 개수 * 글자 하나 넓이` 로 계산할 수도 있을까?

style 이 같더라도 글자 하나하나 마다 넓이가 다 다르기 때문에 어렵다.

결국은 직접 브라우저에 그려봐야지만 알 수 있다.

참고로 [Cuttr.js](https://cuttr.kulahs.de/examples.html) 와 같이 몇 글자수부터 말줄임 처리를 할지에 대한 라이브러리도 있지만, 우리가 원하는 동작은 아니다.

<img src="/static/images/cuttrjs.png" />


### 어떻게 그려보나?

spanIcon 은 무조건 표시되어야 하므로, spanIcon의 넓이는 고정시킨 상태에서, 앞 쪽에 위치한 spanText 부터 글자를 하나씩 채워가며, Box의 Height 변화를 체크해야 한다. 

이 때, 그려보는 내용이 사용자한테는 보이지 않아야 한다.

DOM Tree 에 Element 를 추가하고, [Element.getBoundingClientRect](https://developer.mozilla.org/ko/docs/Web/API/Element/getBoundingClientRect) 를 사용하면,

Syncronous 하게 layout(reflow) 을 강제로 발생시켜, Element 의 뷰포트 내에서 정확한 위치와 크기를 계산하게 된다.

<img src="/static/images/browser-rendering.png" />

참고 : [What forces layout / reflow](https://gist.github.com/paulirish/5d52fb081b3570c81e3a)

layout 단계까지 실행하고, 바로 DOM Tree 에서 추가된 Element 를 제거하면, Paint 는 일어나지 않아 사용자 한테는 보이지 않는다.

### Layout Thrashing 성능 이슈

Reflow는 시간이 오래 걸리는 무거운 작업이므로 브라우저 렌더링 엔진은 Reflow가 발생할 때마다 실행하지 않고 큐에 모아서 어느 순간에 한꺼번에 batch로 처리하는데, 

getClientBoundingRect(), scrollTop과 같은 함수들이 호출되면 최신 스타일을 반영해서 돌려주기 위해 그동안 모아놨던 큐를 비우면서 전부 처리한다. 

브라우저가 성능 향상을 위해 기껏 reflow 발생시키는 애들을 큐에 모아놨는데, 자꾸 scrollTop, innerWidth 등을 호출해버리면 reflow가 그만큼 매번, 자주 일어나게 되어 성능 저하로 이어진다. 

강제 reflow 를 일으키는 함수는 호출을 최대한 줄이는 것이 좋다.

<img src="/static/images/reflow-truncate.png" />

### 이진 탐색으로 최적 문자열 길이 찾기

`getClientBoundingRect` 호출을 줄이기 위해 이진 탐색과 유사한 방식으로 spanText 의 적합한 문자열 길이를 찾아낸다.

데이터가 다음과 같이 주어질 때, 전체 span 의 문자열을 합치고, 이를 기준으로 아래 그림과 같이 이진탐색을 적용한다.

```js
{
   span1: "hello12345"
   span2: "hello99999",
   icon1
}
// all text : hello12345hello99999
```

<img src="/static/images/text-binary.png" />








