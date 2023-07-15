---
title: zero width space 문자 대응하기
date: '2023-07-15'
tags: ['frontend', 'mobile']
draft: false
summary: 'zero width space 는 존재하지만 사람눈에는 보이지 않는 문자라고 한다.'
---

최근에 zero width space 문자 때문에 이슈 원인 파악에 어려움을 겪었다.

### 이슈

input으로 전달받는 string을 정규표현식으로 검사해서 허용하지 않은 특수문자 등이 들어가 있으면 에러를 보여주는 스펙이 있었다. <br />
아래에서 보이는 "A)" 는 분명히 정규표현식에서 허용된 string인데 정규식을 통과하지 못하고 Huawei 디바이스에서만 아래와 같이 에러로 걸렸다.

<img src="/static/images/zero-width-space.png" width="300" />

그래서 처음에는 Huawei 디바이스에서 `)` 가 모양이 비슷한 다른 특수문자로 입력 되었을까 했는데 그건 아니었다..

### 원인

원인은 Huawei 디바이스에서 Native 키보드로 `)` 를 입력할 때 [zero width space](https://en.wikipedia.org/wiki/Zero-width_space) 문자가 추가로 들어 가서 발생했다.

`zero width space` 는 존재하지만 사람눈에는 보이지 않는 문자라고 한다. <br />
띄어쓰기가 없는 중국어와 같은 문자에서 단어를 구분할 때 유용하다고 하다. (그래서 Huawei 디바이스에서만 넣어주는 것 같기도..)

아래에서 띄어쓰기 없이 나열한 단어들 사이에 `zero width space` 를 넣었다. 더블 클릭하면 그냥 나열한 것과 동작이 다른 것을 볼 수 있다.

```js
const withZeroWidthSpace = "바나나​사과​배​복숭아​딸기​오렌지";
withZeroWidthSpace.length;  // 19
const noZeroWidthSpace = "바나나사과배복숭아딸기오렌지"
noZeroWidthSpace.length;  // 14
```

### 수정

수정은 input 에 입력을 받을 때 Zero width space 문자 (unicode 200B) 가 존재하면 제거하도록 해서 수정하였다.

```ts
const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      // remove Zero Width Space character that inputted on Huawei device
      const _value = value.replace(/[\u200B]/g, '');
```

---

### 참조

* https://bionzhun.tistory.com/7
* https://sub0709.tistory.com/79
* https://dfarq.homeip.net/u200b-what-it-is-and-why-it-messes-up-your-code-or-data/
