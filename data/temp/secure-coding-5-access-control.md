---
title: Secure Coding 5 - Access Control
date: '2023-08-15'
tags: ['security', 'frontend', 'backend']
draft: false
summary: '액세스 제어(승인 or 인가라고도 함)는 특정 엔터티에 요구된 동작이나 서비스가 허용되어 있는지 검사하는 프로세스입니다.'
---

### 개요

액세스 제어(승인 or 인가라고도 함)는 특정 엔터티에 요구된 동작이나 서비스가 허용되어 있는지 검사하는 프로세스입니다.

또한 이는 인증과는 다릅니다. 인증은 엔터티의 신원(어떤 계정인지)을 검사하는 프로세스입니다. 이 두 가지 차이점을 알아두는 것은 설계와 개발 시 중요합니다.

이 항에서는 액세스 제어의 몇 가지 권장 사항과 사고방식 등을 함께 설명합니다.

<br />

### Enforce Least Privileges

**권한 최소화는 사용자가 작업을 완료하는 데 필요한 최소 권한만 할당하는 원칙**을 말합니다. 권한 최소화는 폭과 깊이 모두에 적용되어야 합니다. 즉, 액세스할 수 있는 리소스 항목뿐만 아니라 해당 리소스의 동작(보기만? 보기/갱신/삭제?)도 개별적으로 설정할 수 있는 것이 좋습니다.

예를 들어 조직 내에서 회계 담당자와 영업 담당자가 같은 수준의 직급이라 해도 각각 업무 때문에 액세스해야 하는 리소스는 다릅니다. 회계 담당자는 고객 데이터베이스의 액세스 권한을 가져서는 안 되며 마찬가지로 영업 담당자는 직원의 급여 데이터에 액세스할 수 있어서는 안 됩니다. 또한 영업팀 상사는 더 강력한 권한을 가질 수도 있습니다.

아래의 모범 사례도 참고하십시오

* 설계 단계에서는
  * 신뢰 경계 정의
  * 시스템에 액세스하는 사용자의 종류, 시스템 리소스 종류, 각 리소스의 조작 종류 열거
  * 각 사용자 타입과 리소스의 조합으로 가능한 조작 정의
* 설계 단계에서 정의된 권한이 정상적으로 작동하는지 확인하기 위한 테스트 작성
* 애플리케이션이 배포된 후에는 정기적으로 현재 사용자에게 부여된 권한이 설계 단계에서 정의된 권한을 초과하지 않도록 확인
* 재검토를 거쳐 사용자에게 지금까지 갖고 있던 권한을 뺏는 것은 권한을 추가하는 것보다 어렵다는 점에 주의하면서 권한 최소화를 위해 신중히 설계

<br />

### Deny by Default

액세스 제어가 복잡해지면 로직 오류나 기타 실수가 많아지기 쉽습니다. 따라서 모든 요청이 제어 규칙 중 하나에 일치하는 것을 전제로 한 액세스 제어는 실시하면 안 됩니다. **보안을 위해 애플리케이션은 기본적으로 액세스를 거부해야 합니다.**

아래 모범 사례도 참고하십시오.

* 초기 개발 중에도 새로운 기능이나 리소스가 추가되는 경우도 "기본적으로 거부"라는 사고방식이 필요하며, 기본적으로 거부하는 것이 아니라 특정 사용자나 그룹에 권한을 부여하는 경우 그 이유를 명시적으로 정당화할 수 있어야 함
* 몇 가지 프레임워크나 라이브러리에서 이미 "기본적으로 거부" 전략을 취하고 있는 경우에도 명시적으로 설정하는 것이 좋으며 서드파티 코드의 로직은 시간이 지나면서 변할 가능성이 있음

<br />

### Validate the Permissions on Every Request

AJAX 스크립트, 서버 측, 기타 어떤 소스든 권한이 있는지 여부는 요청 시마다 확인해야 합니다.

공격자는 침입 방법을 하나만 찾으면 되며 액세스 제어 확인을 한 번 안 한 것만으로도 리소스의 기밀성/완전성이 손상될 수 있습니다.

개발자는 언제나 일관되게 권한을 확인하기 위해 웹 애플리케이션 프레임워크의 아래와 같은 기능을 사용할 수 있습니다.

* [Spring Security](https://docs.spring.io/spring-security/site/docs/5.4.0/reference/html5/#servlet-security-filters)에 구현된 것을 포함한 [Java/Jakarta EE Filters](https://jakarta.ee/specifications/platform/8/apidocs/javax/servlet/filter)
* [Middleware in the Django Framework](https://docs.djangoproject.com/en/4.0/ref/middleware/)
* [.NET Core Filters](https://learn.microsoft.com/en-us/aspnet/core/mvc/controllers/filters?view=aspnetcore-3.1#authorization-filters)
* [Middleware in the Laravel PHP Framework](https://laravel.com/docs/8.x/middleware)

<br />

### RBAC / ABAC / ReBAC

소프트웨어 엔지니어링에서는 일반적인 액세스 제어 방식으로 RBAC와 ABAC가 널리 이용되어 왔는데, 최근 들어 인기를 얻고 있는 것이 ReBAC입니다.

#### RBAC: Role-Based Access Control

<img src="/static/images/rbac.jpg" />

[ABAC vs. RBAC: What’s the difference?](https://www.citrix.com/blogs/2022/05/17/abac-vs-rbac-comparison/)

RBAC는 사용자에게 할당된 역할을 기반으로 액세스 여부를 제어하는 모델입니다.

**권한은 엔터티에 직접 할당되는 것이 아니라 역할과 연결**되어 있으며 엔터티는 자신에게 할당된 역할과 관련된 권한을 상속하는 형태가 됩니다.

#### ABAC: Attribute-Based Access Control

<img src="/static/images/abac.jpg" />

[ABAC vs. RBAC: What’s the difference?](https://www.citrix.com/blogs/2022/05/17/abac-vs-rbac-comparison/)

ABAC는 사용자와 리소스, 환경에 할당된 속성을 기반으로 액세스 여부를 제어하는 모델입니다.

그 속성에는 예를 들면 이하와 같은 것이 있습니다.

* Job role
* time of day
* Project name
* MAC address
* creation date

#### ReBAC: Relationship-Based Access Control

ReBAC는 리소스의 관계성을 바탕으로 액세스 여부를 제어하는 모델입니다. 예를 들어 게시물을 작성한 사용자만 그 편집을 허용하는 것 등이 있습니다.

Twitter나 Facebook과 같은 SNS 애플리케이션에서 사용자 데이터(트윗, 게시물)에 액세스할 수 있는 사람(친구, 가족, 팔로워)을 사용자 자신이 선택하는 경우 특히 필요합니다.
