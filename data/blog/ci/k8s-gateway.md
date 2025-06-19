---
title: k8s gateway API
date: '2025-06-19'
tags: ['k8s', 'ci']
draft: false
summary: 'k8s ingress의 superset에 해당하는 Kubernetes Gateway API에 대해 알아본다.'
---

k8s ingress의 superset에 해당하는 [Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/)에 대해 알아본다. <br />
ingress nginx 팀에서도 기존 프로젝트를 maintenance로 변경하고, [InGate](https://github.com/kubernetes-sigs/ingate)라는 새로운 프로젝트로 작업을 한다는 소식이 있다. ([issue](https://github.com/kubernetes/ingress-nginx/issues/13002))

### Motivation

Network topology 관점에서 보자면 ingress와 API Gateway 모두는 L7 load balancer에 해당한다(k8s 외부로의 단일 접점 제공, L7 기반 부하 분산).
따라서 이들 둘을 별도로 운용하는 것은 비효율적이다. (이로 인해, 일반적으로는 L4 Load balancer에 API Gateway를 붙여 사용하리라 예상한다).

Kubernetes Gateway API는 이들 문제에 대한 해결안이다.

### What is k8s Gateway API?

Gateway API는 ingress API를 사실 상 대체 가능한 superset 이다. <br />
ingress와 API Gateway 모두는 Network 관점에서 보면 L7 Load balancer에 해당하지만, API Gateway는 ingress와는 달리 L7 protocol(e.g. HTTP)에 특화된 다양한 작업을 수행 가능하다. <br />
**한마디로 말해, k8s Gateway API란 ingress + API Gateway인 셈이다.**

### k8s Gateway API의 resources 및 이들 간 관계

ingress와는 달리 k8s Gateway API는 `Gateway`와 `HTTPRoute` 라는 두 개의 resource로 나누어, Cluster와 application level 담당자를 분리 가능하도록 함과 동시에 application level 내에서도 각기 담당하는 resource를 분리 가능하도록 한다.

#### GatewayClass

- Gateway의 종류를 정의.
- 어떤 컨트롤러가 Gateway resource를 처리할지 지정한다.
- https://gateway-api.sigs.k8s.io/api-types/gatewayclass/

#### Gateway

- 실제 Traffic을 수신하는 LB 역할.
- 접속 host, port, 프로토콜 등을 정의
- https://gateway-api.sigs.k8s.io/api-types/gateway/

#### HTTPRoute

- HTTP Request 를 어떤 Service 로 라우팅 할지 규칙을 정의한다.
- 주요 기능 : route by path/header, redirect, URL rewrite, header modification, [traffic splitting](https://gateway-api.sigs.k8s.io/guides/traffic-splitting/?h=weight#http-traffic-splitting), cross namespace routing
- https://gateway-api.sigs.k8s.io/api-types/httproute/

---

### 참고

- https://imesh.ai/blog/kubernetes-gateway-api-vs-ingress/

- https://konghq.com/blog/engineering/gateway-api-vs-ingress

- https://blog.nginx.org/blog/kubernetes-networking-ingress-controller-to-gateway-api

- https://www.anyflow.net/sw-engineer/kubernetes-gateway-api-1
