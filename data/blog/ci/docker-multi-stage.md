---
title: Docker Multi stage builds 와 Docker Layer Caching
date: '2023-12-29'
tags: ['docker', 'CI']
draft: false
summary: Docker Multi-stage builds 를 활용하여 Docker 이미지 크기를 줄일 수 있고, stage를 병렬로 실행하여 빌드 속도를 향상 시킬 수도 있다.
---

[Docker Multi-stage builds](https://docs.docker.com/build/building/multi-stage/) 를 활용하여 Docker 이미지 크기를 줄일 수 있고, stage를 병렬로 실행하여 빌드 속도를 향상 시킬 수도 있다.
([General best practices for writing Dockerfiles](https://docs.docker.com/develop/develop-images/guidelines/) 참고)

그러면 어떻게 multi-stage 빌드를 활용하는지 알아보자

### multi stage 1 - 도커 이미지 크기 줄이기

Dockerfile에서 `FROM` 키워드를 기준으로 작업공간이 분리되고, 분리된 작업공간을 stage라고 한다. <br />
stage가 여러 개라고 해서 도커 이미지가 여러개 생성되는 것은 아니다. 가장 마지막에 실행된 stage작업이 도커 이미지로 생성된다. <br />
이를 활용하여 build 하는 stage와 build 결과를 실행하는 stage로 분리하여 도커 이미지 크기를 줄일 수 있다. 

프론트엔드 빌드를 예로 들어본다.

reactjs, vuejs등 개발자가 만든 결과를 npm build로 빌드를 수행한다. bulid를 위해 nodejs도 설치하고 npm도 설치해야 한다. 그리고 각각 종속성이 걸린 라이브러리도 설치한다. 고작 몇 MB인 html, css, js를 만드는데 몇 100MB라이브러리를 설치 해야 한다. 그래서 도커 이미지가 불필요하게 엄청 커진다.

하지만 stage를 분리하면 build에 필요한 라이브러리는 stage1에만 설치할 수 있다. build 결과물만 satge2에 복사해서 도커이미지로 생성한다. stage2에서는 html을 서빙하는 nginx와 build결과물만 있기 때문에, stage를 분리하기 전보다 도커 이미지 크기가 엄청 줄어든다.

stage간 파일 복사는 `COPY --from={stage명}` 으로 가능하다.

```dockerfile
# Dockerfile

FROM node:16-alpine as builder

WORKDIR /app
COPY ./my-app ./

RUN npm install && npm run build

FROM nginx:1.21.0-alpine as production
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

### multi stage 2 - 빌드 속도 향상

Multi Stage를 사용하면 Dockerfile작업을 병렬로 실행하여 빌드 속도를 향상 시킬 수 있다. 단, 조건이 있는데, 병렬로 실행하고자 하는 작업이 연관관계가 없어야 한다.

```shell
DOCKER_BUILDKIT=1 docker build -t myapp .
```

위와 같이 빌드 할 때 `DOCKER_BUILDKIT=1` 환경변수를 하나 추가해주면 Docker 18.09 부터 추가된 [Buildkit](https://docs.docker.com/build/buildkit/#buildkit) 이라는 빌드 엔진을 사용할 수 있다. Buildkit을 사용하면 서로 독립적인 stage는 병렬로 수행된다.

예를 들어 아래와 같은 dockerfile에서 s1, s2는 병렬로 수행되어 더욱 빠르다.

```dockerfile
# Dockerfile
FROM debian:buster AS s1
RUN sleep 11
RUN echo 1111 > /opt/one

FROM debian:buster AS s2
RUN sleep 12
RUN echo 2222 > /opt/two

FROM debian:buster
COPY --from=s1 /opt /opt
COPY --from=s2 /opt /opt
```

### Docker Layer Caching을 통한 빌드 속도 향상

위의 Stage 병렬 수행과 별개로 Dockerfile의 각 커맨드 (FROM, COPY, RUN, CMD 등) 들은 새로운 Layer를 만들 수 있다. <br /> 
매번 빌드시마다 각 Layer를 다 실행하면 속도가 매우 느릴 수 있기 때문에, Docker는 Layer Cache를 통해 이 문제를 해결한다.
Layer에서 이전과 변한것이 없다면 기존의 Layer를 재사용해서 build 속도를 개선한다.

https://www.youtube.com/watch?v=_nMpndIyaBU 에서 이를 활용해 `RUN npm install` 결과를 캐싱하여 도커 이미지 빌드 속도를 개선한 사례를 볼 수 있다.

아래의 before, after dockerfile을 확인해보자. package.json 파일만 먼저 복사해서 npm install 을 수행하고 그 뒤에 app을 복사하면, **package.json 만 변경되지 않았다면, npm install 까지 docker layer 캐싱이 된다.**

```dockerfile
# before
FROM node:16-alpine

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 4000

CMD ["node", "app.js"]
```

```dockerfile
# after
FROM node:16-alpine

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 4000

CMD ["node", "app.js"]
```

---

### 참고

- [Docker Multi-stage Build: How to Make Your Docker Image Smaller](https://www.cherryservers.com/blog/docker-multistage-build)
- [Docker Buildkit 으로 빌드 시간 단축하기](https://blukat.me/2021/07/docker-buildkit-speedup/)
- [Docker Layer Caching](https://www.youtube.com/watch?v=_nMpndIyaBU)
