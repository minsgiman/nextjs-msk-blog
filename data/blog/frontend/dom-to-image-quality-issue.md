---
title: dom-to-image 이미지 해상도 이슈 해결하기
date: '2022-09-03'
tags: ['frontend']
draft: false
summary: 'dom-to-image는 html 스크린 캡쳐가 가능한 라이브러리이다. 이를 사용하면서 IOS에서만 이미지 화질이 떨어지는 이슈를 겪었는데, 이에 대한 원인과 수정방법을 정리하였다.'
---

[dom-to-image](https://github.com/tsayen/dom-to-image)는 html 스크린 캡쳐가 가능한 라이브러리이다.

이를 사용하면서 IOS에서만 이미지 화질이 떨어지는 이슈를 겪었는데, 이에 대한 원인과 수정방법을 정리하였다.

#### 원인

css pixel (가상 96DPI 디스플레이에서 하나의 픽셀 크기를 나타냄) 과 device 실제 pixel은 다른데, css pixel은 브라우저 렌더링시 실제 device의 물리적인 픽셀로 변환됨. <br />
ex) css 1 pixel은 4(2\*2) device pixel을 사용 (디바이스 마다 다를 수 있음) -> css 320px는 물리적인 픽셀 640px을 사용해서 그려짐

하지만 dom-to-image 에서 canvas에 그릴때는 device pixel로 변환되지 않고, css pixel 그대로 그림. 그래서 고해상도 디바이스에서 실제 브라우저에서 보는것보다 저화질로 이미지가 생성됨. <br />
dom-to-image 자체에서 이를 보정해줄수도 있으나, 그러면 디바이스 해상도에 따라서 생성되는 이미지 해상도도 바뀔 수 있기 때문에 css pixel 그대로 그림 <br />
ex) css 320px -> 물리적인 픽셀 320px을 사용

#### 해결방법

canvas에 그릴 때 devicePixelRatio (css pixel과 device pixel 비율) 을 통해 실제 device의 물리적인 pixel 로 scale 해주면 사용자가 브라우저에서 보는 것과 동일한 해상도를 가지게 됨

```js
import DomToImage, { Options } from 'dom-to-image';

export async function htmlToImage(el: HTMLDivElement, options: Options) {
  const scale = window.devicePixelRatio;

  return await DomToImage.toPng(el, {
    // get png with base64
    cacheBust: true,
    height: el.offsetHeight * scale, // canvas 크기를 device Pixel Ratio 에 따라 보정
    width: el.offsetWidth * scale,
    style: {
      transform: `scale(${scale})`, // css pixel을 canvas 크기와 맞춰 주기 위해서 scale
      transformOrigin: 'top left',
      width: `${el.offsetWidth}px`, // css pixel
      height: `${el.offsetHeight}px`,
    },
    ...options,
  });
}
```

---

### 참조

- [dom-to-image issue - Why is it blurry](https://github.com/tsayen/dom-to-image/issues/69)

- [devicePixelContentBox를 사용하여 완벽하게 픽셀(pixel-perfect) 렌더링하기](https://ui.toast.com/weekly-pick/ko_20200728)

- [삽질하기 싫으면 꼭 읽어봐야 할 Canvas 트러블 슈팅](https://ui.toast.com/posts/ko_20210526)
