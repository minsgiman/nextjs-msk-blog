---
title: Google Tag Manager vs Page Speed
date: '2022-03-26'
tags: ['gtm', 'frontend', 'performance']
draft: false
summary: 'GTM container에 어떤 Tag를 추가했는지에 따라 페이지 로드속도에 영향을 줄 수 있다. GTM Tag 설정시 어떤 과정을 거쳐야 하고 개선점에 대해 알아본다.'
---

[Google Tag Manager(GTM)](https://support.google.com/tagmanager/answer/6103696?hl=ko) 설치만으로 Web Page 로드속도가 느려지는 것은 아니다.

하지만 GTM container에 어떤 [Tag](https://developers.google.com/tag-platform/devguides#tags)를 추가했는지에 따라 페이지 로드속도에 영향을 줄 수 있다. <br />
Web Page에서 dataLayer에 push하는 이벤트에 따라 GTM에서 설정해놓은 Tag의 코드 snippet이 동기적으로 실행되기 때문이다. <br />

페이지 성능에 영향을 줄 수 있는 GTM Tag 설정시 어떤 과정을 거쳐야 하고 개선점에 대해 알아본다.

### GTM 태그 추가

마케팅 및 사용자분석을 위하여 GTM Tag를 추가한다. <br />
이러한 Tag는 포함하고 있는 script 내용에 따라 페이지 로드 성능저하를 일으킬 수 있다. <br />
그래서 GTM Tag를 추가할 때는 관련된 인원 (개발자, 마케터 등) 모두가 합의후에 진행하고, 추가 후에는 반드시 페이지 성능을 측정해본다.

프로파일링을 통해 페이지 로드 시간을 측정해보거나, <br />
단순히 다음과 같이 GTM dataLayer.push 하는 부분의 실행시간을 측정해볼 수도 있다.

```js
console.time('GTM event');

dataLayer.push({
  event,
  ...data,
});

console.timeEnd('GTM event');
```

<br />

### GTM 컨테이너의 정기적인 점검

1. 더 이상 불필요한 Tag가 실행되고 있지 않은지 확인한다.
2. 모든 페이지에서 실행되는 Tag가 있다면, 특정 페이지에서만 필요한 Tag는 아닌지 점검한다.

   - 특정 페이지에서만 실행된다면 다른 페이지들은 성능에 영향받지 않을 것이다.

3. 등록만 되어 있고 unused 상태인 Tag, Trigger, Variable 들은 정리한다.

<br />

### DOM을 조작하는 태그는 지양한다.

다음과 같은 DOM을 조작하는 태그는 성능에 영향이 크기 때문에 지양한다.

```js
<script>
  (function() {
    var h3 = document.createElement('h3');

    h3.innerText = "An additional element";

    var element = document.querySelectorAll('a')[20];
    if (element) {
      element.parentElement.insertBefore(h3, element.nextSibling);
    }
  })();
</script>
```

<br />

### 페이지 로드 성능에 문제가 있다면 일부 태그 실행을 지연시킨다.

페이지 로드 성능 개선을 위하여 다음과 같이 일부 Tag 실행을 지연시킬 수 있다. <br />
Tag 실행 지연을 시키면 경우에 따라 데이터 정확성에 문제가 생길수도 있으므로 (Google Analytics에서 페이지 속도 측정과 같은..) 관련된 사람들과 논의를 거친후에 적용한다. <br />
지연 실행 방법은 다음과 같다.

1. 다음의 코드를 가지고 있는 [Custom HTML tag](https://support.google.com/tagmanager/answer/6107167?hl=ko#CustomHTML) 를 만든다.

```js
<script>
  (function() {
   try {
     window.setTimeout(
      function(){
       dataLayer.push({'event' : 'afterLoad'});
      }, 1500);
    } catch (err) {}
  })();
</script>
```

2. 1에서 만든 tag에 필요한 trigger를 연결한다.

![object](/static/images/delay-gtm-tag.jpeg 'object')

3. 1에서 보내는 afterLoad 이벤트에 대한 [Custom Event trigger](https://www.analyticsmania.com/post/google-tag-manager-custom-event-trigger/) 를 만든다.

![object](/static/images/afterLoad-custom-event-trigger.jpeg 'object')

4. 3에서 만든 afterLoad Custom Event trigger에 1.5초 후에 실행되어도 되는 Tag들을 연결한다.

<br />

---

### 참조

- [Google Tag Manager vs Page Speed: The Impact and How to Improve](https://www.analyticsmania.com/post/google-tag-manager-impact-on-page-speed-and-how-to-improve/)

- [구글 태그관리자란?](https://analyticsmarketing.co.kr/digital-analytics/google-tag-manager-basics/3002/)
