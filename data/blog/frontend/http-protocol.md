---
title: HTTP Protocol 과 browser connection 개수
date: '2024-01-19'
tags: ['http', 'network', 'browser']
draft: false
summary: 'HTTP Protocol 1.1 버전과 함께 브라우저 connection 제한 관련 내용에 대해 알아보고, HTTP 2.0 및 HTTP 3.0 버전의 차이점에 대해 알아본다.'
---

HTTP Protocol 1.1 버전과 함께 브라우저 connection 제한 관련 내용에 대해 알아보고, HTTP 2.0 및 HTTP 3.0 버전의 차이점에 대해 알아본다.

## HTTP 1.1

* 통짜 Text 메시지 기반 프로토콜
  * 용량, 압축한계가 있고 비효율적이다.
  * Header, Body 를 구분하기 위해 개행 문자 (\n) 를 사용한다.
* 한번 요청시마다 TCP 연결을 맺기 위해 3-way handshake 과정이 필요하고, Request Response 후에 접속을 끊는다.
* connection 을 끊지 않고 재사용하기 위해 (Persistent Connection) keep-alive 를 사용한다. 그래서 3-way handshake 과정을 줄여 latency 를 줄일 수 있다.

```
HTTP/1.1 200 OK
Connection: Keep-Alive
Keep-Alive: timeout=5, max=1000
```

* keep-alive 를 사용하더라도 한번에 하나의 파일만 전송 가능하다. 파이프라이닝 기술이 있지만 여러 파일을 전송할 경우 선행하는 파일의 전송이 늦어지면 HOLB(Head Of Line Blocking)이 발생하였다.

<img src="/static/images/http-holb.png" />

* 그래서 이에 대응하기 위해 동시에 여러개 연결을 맺을 수 있도록 (parallel connection) 브라우저에 지원하나, 무한정 맺을 수 없고 연결 개수가 제한되어 있다. (6 ~ 8개)

#### browser connection 개수 제한과 완화 

대부분 브라우저에서는 connection 개수를 제한하고 있다. 또한 일부 브라우저에서는 connection 제한을 풀어주기도 하였다. 그 이유를 알아보자.

* 일부 브라우저에서 connection 제한을 풀어준 이유 (Opera, IE10, 11, & 12)
  * 브라우저 성능 향상 : 예를 들어 HTML 로드시, 동시에 많은 CSS, JS, Img 파일들 로드하도록 하여 성능 향상
* connection 을 제한한 이유
  * 서버 부담 증가 및 성능 저하 : 브라우저가 6개가 아닌 60개의 연결을 처리할 수 있다면 서버는 잠재적으로 트래픽의 10%만 처리할 수 있습니다.
  * 서버 성능이 저하될 뿐만 아니라 서버가 잠재적으로 사용자를 DDoS 공격으로 취급할 수도 있습니다.

결국 browser connection 제한은 브라우저 성능과 서버 안정성 사이에서 균형을 맞추기 위한 조치이다. <br />
참고 : https://bluetriangle.com/blog/blocking-web-performance-villain

## HTTP 2.0

HTTP 2.0 은 기존 HTTP 1.1 버전의 성능 향상에 초점을 맞춘 프로토콜이다.

* binary 기반 프로토콜
  * 기존의 text 기반 프로토콜보다 빠르고 효율적이다. ( 데이터 파싱 및 전송 속도 증가 )
    * 기존 text 방식은 본문은 압축이 되지만 header는 압축이 되지 않고, header 중복값이 존재한다.
    * 여러개가 아니라 사이즈가 큰 이미지 하나만 전송할 때도 HTTP 2.0 이 HTTP 1.1 보다 빠르다. 
  * Header, body 구분하기 위해 00 비트를 사용한다.

* Stream 과 Frame 단위
  * Frame : HTTP2.0 에서 통신의 최소 단위이며, Header 혹은 Data 가 들어있다.
  * Message : HTTP1.1 에서의 Request, Response 하나와 같은 개념이다. 다수의 Frame 으로 이루어져 있다.
  * Stream : HTTP2.0 에서는 하나의 TCP 연결에서 다수의 Stream 을 생성하여 병렬로 데이터를 주고 받을 수 있다.

<img src="/static/images/http2-connection.png" />

위의 그림과 같이 **Frame** 단위로 이루어진 요청과 응답 **Message** 가 하나의 **Stream** 을 통해 전송된다. <br />
이러한 Stream 들이 하나의 **Connection** 내에서 병렬로 처리되어 속도가 빠르다.

이처럼 하나의 Connection 으로 동시에 여러개의 메시지 Stream 을 응답 순서에 상관없이 주고 받는 것을 멀티플렉싱(multiplexing) 이라고 한다.
* HTTP 1.1 의 Keep-Alive, Pipelining, Head Of Line Blocking 을 개선하였다.

#### Server Push

HTTP 2.0 에서는 Server Push 라는 기능을 제공한다. 이는 Client 요청에 대해 미래에 필요할 것 같은 리소스를 똑똑하게 미리 보낼 수 있다.

예를 들어 HTML 파일을 요청하면, 서버는 그 HTML 문서가 링크하여 사용하고 있는 JS, CSS, Image 파일등의 리소스를 스스로 파악하여 Client 에게 미리 Push 해서 브라우저의 캐시에 가져다 놓는다. <br />
즉, 서버는 요청하지도 않은 리소스를 미리 보내서 성능 향상을 이끌어 낸다.

하지만 Server Push 는 여러가지 문제로 지원하지 않는 브라우저가 많은 것 같다. <br />
[Chrome에서 HTTP/2 서버 푸시 삭제](https://developer.chrome.com/blog/removing-push?hl=ko)

## HTTP 3.0

HTTP 2.0 은 여전히 TCP 기반 위에서 동작되기 때문에, TCP 자체의 hasdshake 과정에서 발생하는 latency 가 존재한다. <br />
기본적으로 TCP는 패킷이 유실되거나 오류가 있을 때 재전송을 하는데 이 재전송하는 패킷에 지연이 발생하면 결국 HOLB(Head Of Line Blocking) 이 발생한다. 애초에 TCP 통신 자체가 가지고 있는 한계가 존재한다.

즉, HTTP 2.0은 TCP/IP 4계층 (Application) 에서 HTTP의 HOLB 를 해결하였지만, 전송 계층 (Transport - 3계층) 에서의 TCP HOLB 를 해결한건 아니기 때문이다.

<img src="/static/images/network-layer.png" />

그러자 구글은 새로운 UDP 기반의 프로토콜인 QUIC 을 고안하게 된다. 그리고 이 새로운 QUIC 프로토콜이 TCP/IP 4계층에도 동작시키기 위해 설계된 것이 바로 HTTP 3.0이다.

<img src="/static/images/http3-protocol.png" />

위에서 볼 수 있듯이 HTTP 3.0 의 계층 형태는 약간 특이하다. <br />
왜냐하면 QUIC 은 TCP + TLS + HTTP 의 기능을 모두 구현한 프로토콜이기 때문이다. <br />
TCP 의 무결성 보장 알고리즘과 SSL 이 이식됨으로써 높은 성능과 동시에 보안을 보장한다. 그래서 계층 위치도 약간 비스듬하게 걸쳐 있게 표현되었다.

그래서 HTTP/3 은 QUIC 을 동작시키기 위해 있는 것이라고 보면되고, QUIC 은 UDP 기반으로 만들어졌기 때문에 Transport 계층의 UDP 위에서 동작한다고 보면된다. 

자세한 설명은 [HTTP 3.0 소개 & 통신 기술 알아보기](https://inpa.tistory.com/entry/WEB-%F0%9F%8C%90-HTTP-30-%ED%86%B5%EC%8B%A0-%EA%B8%B0%EC%88%A0-%EC%9D%B4%EC%A0%9C%EB%8A%94-%ED%99%95%EC%8B%A4%ED%9E%88-%EC%9D%B4%ED%95%B4%ED%95%98%EC%9E%90) 를 참고한다.


### 참고

--- 

* [HTTP 2.0 소개 & 통신 기술 알아보기](https://inpa.tistory.com/entry/WEB-%F0%9F%8C%90-HTTP-20-%ED%86%B5%EC%8B%A0-%EA%B8%B0%EC%88%A0-%EC%9D%B4%EC%A0%9C%EB%8A%94-%ED%99%95%EC%8B%A4%ED%9E%88-%EC%9D%B4%ED%95%B4%ED%95%98%EC%9E%90)

* [TCP / IP 4계층 모델](https://inpa.tistory.com/entry/WEB-%F0%9F%8C%90-TCP-IP-%EC%A0%95%EB%A6%AC-%F0%9F%91%AB%F0%9F%8F%BD-TCP-IP-4%EA%B3%84%EC%B8%B5)

