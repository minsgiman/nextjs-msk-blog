---
title: Docker Container에서 Jenkins 실행하기
date: '2020-11-11'
tags: ['docker', 'jenkins', 'ci']
draft: false
summary: 'https://hub.docker.com/ 에서 jenkins 를 검색하여 이미지를 찾고 설치하여 실행한다.'
---

#### 1. https://hub.docker.com/ 에서 jenkins 를 검색하여 이미지를 찾고 설치하여 실행한다.

```
docker run -p 8080:8080 -p 50000:50000 -d -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
```

- expose port 8080 : By default runs on that port
- expose port 50000 : Master / Slave Communication
- Bind container **\`/var/jenkins_home\`** path to Host OS **\`jenkins_home\`** named volume : persist data of Jenkins
  - [Docker 볼륨 설명](https://www.daleseo.com/docker-volumes-bind-mounts/)

#### 2. 초기 패스워드를 찾아서 입력한다.

- Docker jenkins 실행 후 초기 패스워드 찾기
  - docker exec -it jk cat jenkins초기패스워드경로
  - docker logs jenkins컨테이너이름

#### 3. Suggested Plugin을 설치하고, admin 유저설정

- 초기설정 이후에 Manage Jenkins > Manage Plugins 에서 필요한 플러그인을 설치할 수 있다.

#### 4. Jenkins Job 생성

- Freestyle : simple, single tasks (ex. run tests)
- Pipeline : whole delivery cycle (ex. test | build | ...) for a single branch
- Multibranch Pipeline : like Pipeline for multiple branch of the same repository

---

### 참조

- [Run Jenkins in Docker Container](https://www.youtube.com/watch?v=pMO26j2OUME)
