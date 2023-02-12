---
title: Docker를 사용하여 MongoDB 설치하고 authentication 설정하기
date: '2023-1-1'
tags: ['docker', 'mongodb', 'CI']
draft: false
summary: 'Docker 홈페이지에 접속하여 자신의 OS에 맞는 Docker를 내려 받아 설치한다.'
---

## Docker를 사용하여 MongoDB 설치하고 접속하기

#### 1. Docker 설치

[Docker 홈페이지](https://www.docker.com/products/docker-desktop/)에 접속하여 자신의 OS에 맞는 Docker를 내려 받아 설치한다. <br />
설치가 완료되면 다음 명령어를 실행하여 버전을 출력해 보자.

```
$ docker -v
Docker version 19.03.13, build 4484c46d9d
```

#### 2. MongoDB Docker 이미지 다운로드

다음 명령어로 MongoDB Docker 이미지를 다운로드한다. 태그에 버전을 지정하지 않으면 최신 버전을 다운로드한다.

```
$ docker pull mongo
Using default tag: latest
latest: Pulling from library/mongo
01bf7da0a88c: Pull complete
f3b4a5f15c7a: Pull complete
57ffbe87baa1: Pull complete
77d5e5c7eab9: Pull complete
43798cf18b45: Pull complete
67349a81f435: Pull complete
590845b1f17c: Pull complete
1f2ff17242ce: Pull complete
6f11b2ce0594: Pull complete
91532386f4ec: Pull complete
705ef0ab262e: Pull complete
e6238126b609: Pull complete
Digest: sha256:8b35c0a75c2dbf23110ed2485feca567ec9ab743feee7a0d7a148f806daf5e86
Status: Downloaded newer image for mongo:latest
docker.io/library/mongo:latest
```

MongoDB 버전을 지정하려면 태그에 버전을 지정한다. 다운로드할 수 있는 MongoDB 버전은 [docker hub](https://hub.docker.com/_/mongo/?tab=tags)에서 확인할 수 있다. <br />
다음 명령어로 다운로드한 Docker 이미지를 확인한다.

```
$ docker images
REPOSITORY   TAG       IMAGE ID       CREATED       SIZE
mongo        latest    07630e791de3   12 days ago   449MB
```

#### 3. MongoDB Docker 컨테이너 생성 및 실행

```
$ docker run --name mongodb-container -v ~/data:/data/db -d -p 27017:27017 mongo
```

`-v ~/data:/data/db`는 호스트(컨테이너를 구동하는 로컬 컴퓨터)의 ~/data 디렉터리와 컨테이너의 /data/db 디렉터리를 마운트시킨다. <br />
이처럼 볼륨을 설정하지 않으면 컨테이너를 삭제할 때 컨테이너에 저장되어있는 데이터도 삭제되기 때문에 복구할 수 없다.

다음 명령어로 Docker 컨테이너 리스트를 출력해본다.

```
$ docker ps -a
```

#### 4. MongoDB Docker 컨테이너 시작/중지/재시작

```
# MongoDB Docker 컨테이너 중지
$ docker stop mongodb-container

# MongoDB Docker 컨테이너 시작
$ docker start mongodb-container

# MongoDB Docker 컨테이너 재시작
$ docker restart mongodb-container
```

#### 5. MongoDB Docker 컨테이너 접속

```
$ docker exec -it mongodb-container bash
root@073c229db4e5:/# mongo
```

## Docker MongoDB에 authentication 설정하기

기본적인 방법은 [MongoDB Auhtentication](https://www.mongodb.com/features/mongodb-authentication) 을 참고한다. <br />

#### 1. mongo docker 인스턴스를 실행한다.

```
$ docker run --name mongodb-container -v ~/data:/data/db -d -p 27017:27017 mongo
```

#### 2. 실행한 docker 컨테이너에 접속한다.

```
$ docker exec -it mongodb-container bash
root@b07599e429fb:/#
```

#### 3. mongo shell에 접속하여 'cookie' db에 read & write 권한을 가진 user를 생성한다.

```
root@b07599e429fb:/# mongo
> use cookie
> db.createUser({
    user: 'admin',
    pwd: 'secretPassword',
    roles: [{ role: 'readWrite', db:'cookie' }]
})
```

#### 4. [MongoDB Docker](https://hub.docker.com/_/mongo/?tab=tags)를 참고하여, [mongod --auth](https://www.mongodb.com/docs/manual/reference/program/mongod/#cmdoption-mongod-auth)로 authentication을 활성화하여 다시 실행한다.

```
$ docker stop mongo
$ docker run --name mongodb-container -v ~/data:/data/db -d -p 27017:27017 mongo mongod --auth
```

#### 5. 생성한 user id, pwd를 통해 접속할 수 있다.

```
mongo <ip>:27017/cookie -u admin -p secretPassword
```

node에서 mongoose를 통해 접속할때는 다음과 같은 URI로 connect한다. ( [참고](https://www.mongodb.com/community/forums/t/how-can-connect-to-mongo-db-authentication-by-node-js/124406) )

```js
mongoose.connect(
  `mongodb://admin:secretPassword@<ip>:27017/cookie?authMechanism=DEFAULT&authSource=cookie`,
  {
    dbName: 'cookie',
  },
  () => {}
);
```

---

### 참고

- [docker hub mongo](https://hub.docker.com/_/mongo?tab=description)

- [How to enable authentication on MongoDB through Docker?](https://stackoverflow.com/questions/34559557/how-to-enable-authentication-on-mongodb-through-docker)
