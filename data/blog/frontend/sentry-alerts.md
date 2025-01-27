---
title: Sentry Alerts 설정하기
date: '2023-04-09'
tags: ['frontend', 'sentry']
draft: false
summary: 'Sentry를 통해 긴급한 에러가 발생하거나 에러개수가 급증한다거나 할 때 메일, 슬랙등을 통해 알림을 받을 수 있다.'
---

Sentry를 통해 긴급한 에러가 발생하거나 에러개수가 급증한다거나 할 때 메일, 슬랙등을 통해 알림을 받을 수 있다. 

이는 Sentry Alerts 탭에서 alerts룰을 만들어 설정할 수 있다.

<img src="/static/images/sentry-alert-listing.png" />

Sentry에서 설정할 수 있는 Alerts에는 [Issue Alerts](https://docs.sentry.io/product/alerts/#issue-alerts)과 [Metric Alerts](https://docs.sentry.io/product/alerts/#metric-alerts-for-errors--performance)이 있다. 

## Issue Alerts

Issue Alerts 설정은 Triggers, Filters, Actions 으로 이루어진다.

#### 1. ["When" Conditions: Triggers](https://docs.sentry.io/product/alerts/create-alerts/issue-alert-config/#when-conditions-triggers)
알림을 통해 모니터링 하고싶은 조건을 설정한다.

* New issue is created
* Changes state from resolved to unresolved
* Changes state from ignored to unresolved
* 이슈 발생 횟수가 특정 숫자보다 높아질 때
* 이슈를 겪은 unique users수가 특정 숫자보다 높아질 때
* 특정 기간동안 전체 세션 중 몇% 이상 겪었을 때

#### 2. ["If" Conditions: Filters](https://docs.sentry.io/product/alerts/create-alerts/issue-alert-config/#if-conditions-filters)
When조건이 만족한 이슈중에 한번 더 filter를 걸기 위해 설정한다.

* The issue is older or newer than a certain duration.
* The issue has happened at least \{X\} times.
* The issue is assigned to \{no one, a team, a member\}.
* The event is from the latest release.
* The event's \{attribute\} \{matches\} \{value\}. 
   * Match types: equals, does not equal, starts with, ends with, contains, does not contain, is set, or is not set.
* The event's \{tag\} \{matches\} \{value\}. 
   * Match types: equals, does not equal, starts with, ends with, contains, does not contain, is set, or is not set.
* The event's level \{matches\} \{level\}. 
   * Match types: equal to, less than or equal to, or greater than or equal to.

#### 3. [“Then” Conditions: Actions](https://docs.sentry.io/product/alerts/create-alerts/issue-alert-config/#then-conditions-actions)
위에서 Triggers, Filters 조건을 만족하였을 때 실제로 slack, mail 등으로 alert을 보내기 위한 설정을한다. 자세한 내용은 공식문서를 참고한다.

#### 4. [Action Interval (Rate Limit)](https://docs.sentry.io/product/alerts/create-alerts/issue-alert-config/#action-interval-rate-limit)
위의 Triggers, Filters 조건을 만족하였을 때, action이 수행될 수 있는 빈도를 제어한다. <br />
예를 들어 Action Interval을 1분으로 설정하였다면, 1분내에서는 조건이 여러번 만족되더라도 action이 한번 수행된다.  

#### Issue Alert 설정 예제

먼저 에러의 Severity를 다음과 같이 정의한다.

* Severity classification
  * fatal
    * 핵심 기능이 오동작 하거나 동작하지 않아서, 사용자에게 큰 불편을 초래하거나 금전적 손실이 발생하는 경우
    * 화면이 렌더링 되지 않는 경우
  * error
    * 핵심 기능에는 영향이 없지만, 특정 동작이 오동작하여 사용자에게 불편을 유발시키는 경우
    * 화면에 일부 정보가 누락되거나 잘 못 나오는 경우
  * warning
    * system 이나 코드 에러로 보기 어려운 경우 (ex - network 이슈로 인한 chunk loading error)
    * API 500 error (별도로 BE 쪽에서 모니터링 하고 있어, FE 에서는 알림을 받지 않아도 되는 경우)

위에서 정의한 Severity에 따라 Error 이벤트에 Level(fatal, error, warning) 을 설정하고, 이에 따른 Issue Alert 룰을 다음과 같이 정의한다. 

* fatal Level Issue Alert
  * 한 이슈의 발생한 에러의 갯수가 5분 동안 30회 이상인 경우
  * 한 이슈에 대해 영향받은 사용자 수가 5분 동안 10명 이상인 경우
* error Level Issue Alert 
  * 한 이슈의 발생한 에러의 갯수가 15분 동안 200회 이상인 경우
  * 한 이슈에 대해 영향받은 사용자 수가 15분 동안 80명 이상인 경우
* warning Level Issue Alert
  * No Alert

위에서 정의한 룰을 가지고 sentry dashboard 에서 다음과 같이 Issue Alert 을 설정한다.

<img src="/static/images/issue-alert.png" />


## Metric Alerts

Metric Alerts 설정은 Type + Function + Time Interval로 구성되어 있다.

#### 1. [Type의 종류](https://docs.sentry.io/product/alerts/create-alerts/metric-alert-config/#metrics-types-for-alerting)는 다음과 같다.
* Errors
   * Number of Errors
   * Users Experiencing Errors
* Sessions
   * Crash Free Session Rate
   * Crash Free User Rate
* Performance
   * Throughput
   * Transaction Duration
   * Apdex
   * Failure Rate
   * Largest Contentful Paint
   * First Input Delay
   * Cumulative Layout Shift

#### 2. 사용할 수 있는 [Function](https://docs.sentry.io/product/alerts/create-alerts/metric-alert-config/#functions-for-metric-types)은 다음과 같다. <br />
예를 들어 Metric type을 LCP로 설정할 때 `p75(measurement.lcp)` 와 같이 설정할 수 있다.

* count()
* count_unique(...)
* avg(...)
* percentile(...)
* failure_rate()
* apdex(...)
* count()
* p50()
* p75()
* p95()
* p99()
* p100()

#### 3. [Time Interval](https://docs.sentry.io/product/alerts/create-alerts/metric-alert-config/#time-interval)을 통해 설정된 기간동안 Sentry에서 수치를 집계한다.
Time Interval은 1분에서 1일 사이로 설정한다.
자세한 설정은 공식문서를 참고한다.

#### Metric Alert 설정 예제

위에서 정의한 fatal level 에 대하여 다음과 같이 룰을 정의한다.

* Number of Errors
  * 모든 fatal 에러 카운트가 15분 동안 200회 이상인 경우
* User Experiencing Erros
  * 모든 fatal 에러 사용자 수가 15분 동안 100명 이상인 경우

sentry dashboard 에서는 다음과 같이 Metric Alert 을 설정한다.

<img src="/static/images/metric-alert.png" />

## Best Practices

Sentry 문서에서 보여주는 [Best Practices](https://docs.sentry.io/product/alerts/best-practices/)는 주로 Issue Alerts에 초점이 맞춰져있다. <br />
자주 사용되는 Issue Alerts trigger는 다음과 같다.

* Number of events in an issue
* Number of users affected by an issue
* Percent of sessions affected by an issue

## Notification
위에서 본 Alerts외에 Sentry는 또한 [Notifications](https://docs.sentry.io/product/alerts/notifications/)를 설정할 수 있다. <br />
이를 통해 Issue 상태변경, 배포, Weekly reports 알림 등을 받을 수 있다. <br />
설정할 수 있는 Notifications는 다음과 같다. <br />

* Workflow
  * Issue Resolved
  * Regressions(issue changes from Resolved back to Unresolved)
  * Comments
  * Assignment
  * User Feedback
  * Event Processing Problems
* Deploy (new version deployed)
* Quota Notifications
* Weekly Reports

---

## 참고

- [Sentry Alerts 공식문서](https://docs.sentry.io/product/alerts/)