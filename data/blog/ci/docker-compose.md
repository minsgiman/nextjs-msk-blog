---
title: Docker compose
date: '2024-01-02'
tags: ['docker', 'ci']
draft: false
summary: 'docker compose는 단일 서버에서 여러개의 컨테이너를 하나의 서비스로 정의해 컨테이너 묶음으로 관리할 수 있는 작업환경을 제공하는 관리도구이다.'
---

### docker compose 소개

[docker compose](https://docs.docker.com/engine/reference/commandline/compose/)는 단일 서버에서 여러개의 컨테이너를 하나의 서비스로 정의해 컨테이너 묶음으로 관리할 수 있는 작업환경을 제공하는 관리도구이다.

docker compose를 사용하면 기존에 아래와 같이 여러개의 docker run 명령어를 실행하거나 여러 옵션을 \ 로 구분하여 길게 작성하는 부분들을 yml 파일로 작성할 수 있다.  

```shell
$ docker run -d --name wordpress_db \
    --network test_network \
    -p 3306:3306 \
    -e MYSQL_ROOT_PASSWORD=123 \
    -e MYSQL_USER=test \
    -v mysql:/var/lib/mysql \
    --restart unless-stopped \
    mysql:8

$ docker run -d --name test_wordpress \
    --network test_network \
    -p 8080:80 \
    --link wordpress_db:mysql  \
    -e WORDPRESS_DB_PASSWORD=123 \
    -e WORDPRESS_DB_USER=test \
    --restart unless-stopped \
    wordpress:latest
```

```yaml
version: '3.9'

services:
  db:
    image: mysql:8
    volumes:
      - db:/var/lib/mysql
    restart: unless-stopped
    environment:
      - MYSQL_ROOT_PASSWORD=123
      - MYSQL_USER=test
    networks:
      - wordpress
  
  wordpress:
    depends_on:
      - db
    image: wordpress:latest
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - WORDPRESS_DB_PASSWORD=123
      - WORDPRESS_DB_USER=test
    networks:
      - wordpress

volumes:
  db: {}
  
networks:
  wordpress: {}
```

이제 작성한 yaml 파일을 `docker compose up -d` 로 실행시켜주면 된다. -d 옵션은 백그라운드에서 컨테이너를 띄우기 위한 옵션이다. <br />
up 에 대한 자세한 옵션들은 [docker compose up](https://docs.docker.com/engine/reference/commandline/compose_up/) 를 참고한다.


### 프론트엔드 배포시 활용

FE 빌드 및 배포시 서버 환경별로 node 버전 관리가 어려운 문제가 있었기 때문에, docker를 활용하여 문제를 해결하였다.

docker-compose.yml
```yaml
version: "3.8"
services:
  builder:
    container_name: builder
    extends:
      file: docker-compose-common.yml
      service: my-installer
    build:
      context: .
      dockerfile: Dockerfile
      target: installer
      args:
        progress: plain
    working_dir: /app
    entrypoint: ["yarn", "run"]
```

docker-compose-common.yml
```yaml
version: "3.8"

services:
  my-installer:
    container_name: my-installer
    build:
      context: .
      dockerfile: Dockerfile
      target: installer
      args:
        progress: plain
    volumes:
      - ${PWD}:/app
      - /app/node_modules
      - /app/apps/my-app/node_modules
      - /app/apps/my-app2/node_modules
    stdin_open: true
    tty: true
```

Dockerfile
```dockerfile
FROM node:21.3.0-alpine AS base

RUN apk add --no-cache --update openjdk12-jdk \
        vim \
        tzdata \
        chromium \
        font-noto \
        font-noto-thai \
        git \
  && cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime \
  && echo "Asia/Seoul" > /etc/timezone

# Remove except the NotoSans font
RUN find /usr/share/fonts/noto -type f ! -name 'NotoSansThai-*' -and ! -name 'NotoSans-*' -delete \
    && find /usr/share/fonts -type d ! -name 'noto' -and ! -name 'fonts' -exec rm -rf {} + \
    && fc-cache -f -v 

# Do not install chromium while installing packages
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
# configure chomium location for node
ENV CHROMIUM_PATH /usr/bin/chromium-browser

#######
## install pakcages
#######
FROM base AS installer

ARG HOST_CONFIG_DIR=.temp-config

# create and move working directory
WORKDIR /app

# copy pakcage.json
COPY $HOST_CONFIG_DIR .

RUN npx browserslist@latest --update-db --yes
# install packages
RUN yarn install --frozen-lockfile

########
### builder
########
#FROM installer AS builder
#
#ENTRYPOINT ["yarn", "run"]
```

위에서 작성한 yaml 파일을 아래 [docker compose run](https://docs.docker.com/engine/reference/commandline/compose_run/) 으로 실행시킨다. <br />

```shell
docker compose -f ./script/docker/docker-compose.yml run --rm builder build:prod
```

* up이 yaml 파일에 정의되어 있는 모든 서비스 컨테이너를 생성하고 실행한다면, run 은 서비스 컨테이너의 특정 명령어를 일회성으로 실행한다.
* --rm 옵션은 컨테이너를 실행 한 후에 자동으로 제거하는 옵션이다.

위에 명령은 ```./script/docker/docker-compose.yml``` 파일을 읽어서 builder 서비스 컨테이너를 생성하고 builder 컨테이너에 build 명령을 내린다. <br />
`entrypoint`로 \["yarn", "run"\] 을 지정해주었기 때문에 Dockerfile 의 컨테이너에 `yarn run build:prod` 명령이 실행된다. <br />
그리고 volumes 로 연결해두어서 컨테이너에서 수행한 빌드 결과물을 로컬에서 조회할 수 있다.

그밖에 nginx 구축시 docker compose 설정 파일은 다음을 참고한다.
* https://github.com/minsgiman/docker-compose-nginx/blob/master/nginx-apps/docker-compose.yml