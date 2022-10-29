---
title: Chrome Performance - network 분석하기
date: '2022-10-29'
tags: ['frontend']
draft: false
summary: 'Chrome 에서 performance를 측정할때, network 영역에서 보여주는 내용을 살펴본다.'
---

Chrome 에서 performance를 측정할때, network 영역에서 보여주는 내용을 살펴본다.

<img src="/static/images/chrome-performance-network.png" width="800" />

#### Network Resources Color Codes

Performance - network 에서 Resource 타입별로 Request를 어떤 색깔로 표시하는지 확인한다.

<img src="/static/images/color-codes.png" width="400" />

#### Network Request line-bar

이제 네트워크 요청의 line-bar가 무엇을 나타내는지 확인해본다.

<img src="/static/images/network-line-bar.png" width="400" />

아래의 Timing 이미지를 참고하여 살펴본다.

- 왼쪽의 line은 Queueing ~ Initial connection 까지를 의미한다. (request sent 전까지 모든 단계)
- bar의 연한 부분은 Request sent ~ Waiting(TTFB - Time-to-First-Byte) 까지를 의미한다.
- bar의 어두운 부분은 Content Download를 의미한다.
- 오른쪽의 line은 main thread가 처리하기를 기다리는 시간을 의미한다. (이 부분은 Timing tab에 표시되지 않는다.) network로 response를 전달받았으나, 브라우저가 바빠서 code로 response를 전달하지 못하고 있는 시간이다.

<img src="/static/images/network-timing.png" width="400" />

더 자세한 내용은 다음 문서를 참고한다. <br />
https://developers.google.com/web/tools/chrome-devtools/evaluate-performance/reference#network
