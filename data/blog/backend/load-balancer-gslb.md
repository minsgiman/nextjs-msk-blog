---
title: Load Balancer 알아보기(1) - GSLB(Global server Load Balancing)
date: '2023-03-05'
tags: ['load balancer', 'GSLB', 'backend']
draft: false
summary: 'DNS를 기반으로 동작하는 로드밸런서 GSLB(Global server Load Balancing)에 대해 알아본다.'
---

DNS를 기반으로 동작하는 로드밸런서 GSLB(Global server Load Balancing)에 대해 알아본다. <br />
GSLB는 CDN(content delivery network)을 가능하게 하는 기술이다.

CDN은 미리 정적인 자원들(html, css, javascript 등)을 캐싱하여 사용자의 위치와 가까운 곳에 복사본을 노드에 저장하고, 빠른 속도로 자원들을 제공할 수 있게 해준다. <br />
cdn은 ddos같은 서버 다운을 시킬 수도 있는 악의적인 공격을 방어하는데도 매우 효율적이다.

CDN에서 WAF(Web Application Firewall)를 설정하여 악의적인 웹 트래픽을 탐지하고 차단하여 Web Application의 보안을 강화할 수 있다. WAF는 다양한 보안 규칙을 사용하여 Web Application에서 발생할 수 있는 다양한 유형의 공격을 탐지한다. <br /> 
이러한 규칙 중 하나에 "rate limit" 규칙이 있다. "rate limit" 규칙은 Application에 대한 요청을 제한하는데 사용된다. <br />
다음은 CDN(Cloudflare)에서 WAF rate limit rules 를 설정한 예이다.

```
WAF rate limit rules

* Rule: directory traversal  
* Condition: 동일한 IP로부터 30분내 origin 서버로부터 404 응답을 받은 request가 30회 이상

* Rule: unauthorized attempts
* Condition: 동일한 IP로부터 1분내 origin 서버로부터 401 or 403 응답을 받은 request가 20회 이상

* Rule: POST method (100 req/2 min)
* Condition: 동일한 IP로부터 2분내 POST method 요청이 100회 이상

* Rule: high volume of requests (500 req/10 min)
* Condition: 동일한 IP로부터 10분내 request가 500회 이상
```

위의 룰에 걸리게되면 CDN(Cloudflare)에서 origin 서버로 request를 forward 하지 않고, 대신 Error Page를 보내거나 API 요청인 경우는 429(Too Many Requests) response를 보낸다.

## 1. GSLB

GSLB는 DNS 서비스의 발전된 형태이다.

DNS 서비스는 도메인 이름을 IP주소로 변환하는 일을 하는 서비스다. 하나의 도메인 주소에 대해서 여러 개의 IP주소를 넘겨줄 수 있는데, 이 기능을 이용해서 가용성 구성과 로드 밸런싱 기능을 수행할 수 있다. <br />
하지만 가용성과 로드 밸런싱이 본 기능은 아니라서 (단지 Round Robin 방식으로만 가능하다), 이런 목적으로 사용하기에는 한계가 있다.

예를들어 클라이언트가 표준 DNS에 질의를 할 경우, DNS 서버는 로컬 데이터베이스의 IP 목록을 확인해서 그 중 하나를 반환 할 뿐, 네트워크 지연, 성능, 트래픽 유입, 서비스 실패 등은 전혀 고려하지 않는다. <br />
이런 DNS의 한계를 해결하여 인터넷 영역에서 로드 밸런싱을 구현한 것이 GSLB이다. 

## 2. GSLB와 DNS 작동방식 비교

#### 2.1 재해복구

DNS는 서버의 상태를 알 수 없다. 따라서 서비스를 실패하는 유저가 생길 수 있다.

<img src="/static/images/dns-error.png" />

GSLB는 서버의 상태를 모니터링 한다. 실패한 서버의 IP는 응답에서 제외 하므로, 유저는 서비스를 계속 이용할 수 있다. (health check)

<img src="/static/images/gslb-error.png" />

#### 2.2 로드밸런싱

DNS는 Round Robin 방식을 사용한다. 정교한 로드 밸런싱이 힘들다.

<img src="/static/images/dns-load.png" />

GSLB는 서버의 로드를 모니터링 한다. 로드가 적은 서버의 IP를 반환하는 식으로 정교한 로드밸런싱을 할 수 있다.

<img src="/static/images/gslb-load.png" />

#### 2.3 레이턴시 기반 서비스

DNS는 Round Robin 방식을 사용한다. 유저는 네트워크상에서 멀리 떨어진 위치의 서버로 연결 할 수도 있다.

<img src="/static/images/dns-latency.png" />

GSLB는 각 지역별로 서버에 대한 레이턴시(latency) 정보를 가지고 있다. 유저가 접근을 하면, 유저의 지역으로 부터 가까운(더 작은 레이턴시를 가지는) 서버로 연결을 한다.

<img src="/static/images/gslb-latency.png" />

#### 2.4 위치기반 서비스

DNS에서 유저는 Round Robin하게 서버로 연결된다.

<img src="/static/images/dns-location.png" />

GSLB는 유저의 지역정보를 기반으로, 해당 지역을 서비스하는 서버로 연결 할 수 있다.

<img src="/static/images/gslb-location.png" />

## 3. GSLB 주요 기술 요소들 

#### 3.1 Health Check

GSLB는 등록된 호스트들에 대해서 주기적으로 health check를 수행한다. 호스트가 실패할 경우 DNS 응답에서 해당 호스트를 제거한다. 실패한 호스트로의 접근을 막기 때문에 서버의 가용성을 높일 수 있다.

<img src="/static/images/gslb-health-check.png" />

#### 3.2 TTL

DNS에서 권한을(authoritative) 가진 네임서버는 특정 레코드에 대해서 TTL을 설정할 수 있다. 캐시 네임서버는 TTL시간동안 캐시에 저장해둔다. 클라이언트로 부터 요청이 오면, 캐시에 저장된 걸 반환한다.

만약 TTL 값이 지나치게 길다면, GSLB의 상태정보가 제때 동기화 되지 않을 거다. 반대로 TTL 값이 지나치게 짧으면, 네임서버에 가해지는 부담이 커진다. GSLB와 같이 주소 변경에 민감한 서비스라면 부하를 감수하고라도 TTL 값을 짧게 가져가야 한다.

#### 3.3 네트워크 거리 & 지역

주기적으로 성능을 측정하고 그 결과를 저장한다. DNS 질의가 오면, 지리적으로 가까운 서버를 반환하거나 네트워크 거리가 가까운 서버를 반환한다. 지리적으로 가까운 서버의 경우 RTT(Round Trip Time)도 짧기 때문에, 동일한 결과를 반환하는 경우가 많다.

## 4. 상세 작동 프로세스

DNS의 프로세스는 아래와 같다.

<img src="/static/images/dns-query.png" />

GSLB는 Local name server와 Second Level name server 사이에 위치한다.

<img src="/static/images/dns-query-gslb.png" />

GSLB policy

<img src="/static/images/gslb-policy.gif" />

---

### 참조

- [Enterprise를 위한 GSLB(Global Server Load Balancing) - 1편: 개념 및 서비스 로직](https://www.netmanias.com/ko/post/blog/5620/dns-data-center-gslb-network-protocol/global-server-load-balancing-for-enterprise-part-1-concept-workflow)

- [GSLB란?](https://coding-start.tistory.com/339)
