---
title: Load Balancer 알아보기(2) - L4, L7 로드밸런서 그리고 nginx
date: '2023-03-08'
tags: ['load balancer', 'nginx', 'backend']
draft: false
summary: 'L7 Load Balancer는 L7(Application Layer) 위에서 동작하기 때문에 IP, Port 이외에도 URI, Payload, Http Header, Cookie 등의 내용을 기준으로 부하를 분산한다.'
---

### L4 vs L7 Load Balancer

**L4 Load Balancer**는 IP, Port 를 기준으로 스케줄링 알고리즘을 통해 부하를 분산한다.

**L7 Load Balancer**는 L7(Application Layer) 위에서 동작하기 때문에 IP, Port 이외에도 URI, Payload, Http Header, Cookie 등의 내용을 기준으로 부하를 분산한다. 그래서 콘텐츠 기반 스위칭이라고도 한다.

L4 Load Balancer는 단지 부하를 분산시키는 것이라면, L7 Load Balancer는 요청의 세부적인 사항을 두고 결제만 담당하는 서버, 회원가입만을 담당하는 서버 등으로 분리해서 가볍고 작은 단위로 여러 개의 서비스를 운영하고 요청을 각각의 서버에 분산할 수 있다. <br />
L7 Load Balancer는 L4 Load Balancer와 다르게 데이터를 분석해서 처리가 가능하기 때문에 악의적이거나 비 정상적인 콘텐츠를 감지해 보안 지점을 구축할 수도 있는 장점이 있고, 그 만큼 자원 소모가 크다는 단점이 있다.

<img src="/static/images/l4-l7-load-balancer.png" />

그러면 L7 Load Balancer에 해당하는 nginx에 대해 알아본다.

### Nginx 역할

nginx는 고성능 로드밸런서이며 logic integration을 할 수 있는 장점을 가지고 있다.

* nginx는 일부 트래픽을 cache할 수 있고, backend application이 부하가 걸려서 제대로 응답하지 못하는 상황에서 sorry 컨텐츠를 보여줄 수도 있다.
* 어떤 request는 우선순위를 두고 처리할 수도 있는데, header의 cookie값등을 통해서 우선순위가 높은 사용자의 request인지 판단할 수도 있을 것이다.
* 또한 악의적인 사용자들의 공격을 방어하는 역할도 수행하는데, 뒤에서 어떤 Application이 동작하는지(WAS 서버 정보 등)와 같은 주요정보를 숨길 수 있다. (proxy 역할)
* 서버의 안정성을 위해 주어진 특정한 시간 동안 HTTP 요청량을 제한할 수 있는 Rate Limiting 을 설정할 수도 있다.
  * [커넥션 수를 제한하는 limit_conn 모듈](https://nginx.org/en/docs/http/ngx_http_limit_conn_module.html) 
  * [요청 수를 제한하는 limit_req 모듈](https://nginx.org/en/docs/http/ngx_http_limit_req_module.html) 

### Nginx 로드밸런스 설정

그러면 nginx에서 로드밸런스 설정을 살펴보자.

```
server {
  # 생략...
}

upstream express-app {
  # least-connected 설정
  least_conn;
  
  # IP hash 기반으로 하고 싶은 경우 아래로 설정
  # ip_hash; 

  server 127.0.0.1:7000 weight=2 max_fails=3 fail_timeout=30s;
  server 127.0.0.1:8000 max_fails=3 fail_timeout=30s;
  server 127.0.0.1:9000 backup;
}
```

nginx에서 지원하는 로드밸런싱 방법이다.

* round-robin: 라운드 로빈방식으로 서버를 할당 (설정 하지 않을 시 default)
* least-connected: 커넥션이 가장 적은 서버를 할당
* ip-hash: 클라이언트 IP를 해쉬한 값을 기반으로 특정 서버를 할당

또한 다음의 옵션들을 사용할 수 있다.

* weight=n: upstream 서버의 비중을 나타낸다. 이 값을 2로 설정하면 그렇지 않은 서버에 비해 두배 더 자주 선택된다.
* max_fails=n: n으로 지정한 횟수만큼 실패가 일어나면 서버가 죽은 것으로 간주한다.
* fail_timeout=n: max_fails가 지정된 상태에서 이 값의 설정만큼 서버가 응답하지 않으면 죽은 것으로 간주한다.
* down: 해당 서버를 사용하지 않게 지정한다. ip_hash; 지시어가 설정된 상태에서만 유효하다.
* backup: 모든 서버가 동작하지 않을 때 backup으로 표시된 서버가 사용되고 그 전까지는 사용되지 않는다.

### Nginx 관리 Tip

#### 주석을 꼼꼼히 남긴다.
기존에 있는 설정을 함부로 변경하기 어렵기 때문에 주석을 꼼꼼히 남겨놓는다.

#### 비즈니스 로직은 nginx 보다는 WAS로
검증이 어려운 nginx에 복잡한 설정과 비즈니스 로직을 넣기보다는 WAS로 이관한다.

#### git으로 관리한다.
변경 이력관리나 PR 등을 하기 위해서 nginx 설정도 git으로 관리하고 git-flow를 따른다.

#### mirror 모듈을 통한 테스트 

[mirror 모듈](http://nginx.org/en/docs/http/ngx_http_mirror_module.html) 을 사용해서 요청을 복제하여 또 다른 block or upstream 서버로 보내줄 수 있다. <br />
이 기능을 통해 request 처리를 테스트해보거나 body 부분을 로깅하는데도 활용할 수 있다.

```
location / {
	mirror /mirror;
	proxy_pass http://location.to;
}

location /mirror {
	internal;
	proxy_pass http://location.to.mirror;
}
```
location으로 /mirror을 등록하고, internal 지시어를 통하여 해당 path는 내부적으로만 접근할 수 있게 강제한다. (외부에서 도메인이나 ip타고 들어오는 경우엔 접근할 수 없다는 의미) <br />
그리고 해당 path에 proxy_pass를 설정한 다음 mirror로 /mirror를 등록하면 된다. 

이렇게 되면 /으로 오는 요청은 항상 location.to, location.to.mirror에 모두 전달되지만, location.to.mirro 응답은 nginx단에서 버려진다. 즉, 웹 서버 본연의 요청-응답 모델에 어떠한 영향 없이 스니핑이 가능한 상태가 된다.

---

### 참조

- [NGINX, 기술 부채가 되지 않으려면?](https://www.youtube.com/watch?v=h0LMEVDXCxE)
- [nginx documentation](https://nginx.org/en/docs/)
- [Using nginx as HTTP load balancer](http://nginx.org/en/docs/http/load_balancing.html)
- [nginx 로드 밸런싱 설정](https://www.lesstif.com/system-admin/nginx-load-balancing-35357063.html)
