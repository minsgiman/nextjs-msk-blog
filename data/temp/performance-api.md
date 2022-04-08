---
title: Performance API
date: '2022-03-26'
tags: ['frontend', 'performance']
draft: false
summary: ''
---

사용자 지정 지표 API

Lighthouse나 Sentry의 Performance처럼 직접 성능 대시보드나 성능 측정 서비스를 만들어야 한다면 [W3C Web Performance Working Group](https://www.w3.org/webperf/)에서 책정하고 있는 사용자 지정 지표를 사용해야 한다. 해당 지표의 API 종류는 다음과 같다.

이들 API를 이용해서 Web vitals에 필요한 대부분의 데이터를 수집할 수 있다.

[overview](https://w3c.github.io/perf-timing-primer/#overview)

[User Timing API](https://developer.mozilla.org/en-US/docs/Web/API/User_Timing_API)
[Long Tasks API](https://developer.mozilla.org/en-US/docs/Web/API/Long_Tasks_API)
[Element Timing API](https://developer.mozilla.org/en-US/docs/Web/API/Element_timing_API)
[Navigation Timing API](https://developer.mozilla.org/ko/docs/Web/API/Navigation_timing_API)
[Resource Timing API](https://developer.mozilla.org/en-US/docs/Web/API/Resource_Timing_API/Using_the_Resource_Timing_API)
[Server Timing](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Server-Timing)

개발 환경에서 측정

[Web Vitals Chrome Extension](https://github.com/GoogleChrome/web-vitals-extension)
[Lighthouse](https://developers.google.com/web/tools/lighthouse)
[WebPageTest](https://www.webpagetest.org/)

서비스를 이용한 측정 (Real User Monitoring)

Search console
CrUX dashboard
CloudWatch
DATADOG
Sentry

Sentry 서비스는 흔히 에러 로그를 수집하고 대응하기 위해서 사용하는 도구로 알려져 있다. Sentry는 익히 알고 있는 기능 뿐 아니라 Performance Monitoring 기능도 제공하는데 여기에 Web Vitals 측정 기능도 포함하고 있다.
