---
title: Docker 커맨드
date: '2020-11-11'
tags: ['docker', 'ci']
draft: false
summary: 'Docker 설치 | 이미지 관리 | 컨테이너 관리 | 컨테이너 설정'
---

### Docker 설치

- 관리자 권한 변경 : sudo -i
- 도커 설치 (Ubuntu) : apt install docker.io

### 이미지 관리

- 도커 이미지 검색 : docker search 이미지이름
- 다운로드 이미지 리스트보기 : docker images
- 이미지 다운로드 (PULL) : docker pull 이미지이름
- 이미지 삭제 (RMI) : docker rmi 이미지이름

### 컨테이너 관리

- 컨테이너 실행 (START)
  - docker start -d 컨테이너ID
  - -d : 백그라운드로 실행
- 컨테이너 중지 (STOP) : docker stop 컨테이너ID or 컨테이너이름
- 컨테이너 재실행 : docker restart 컨테이너ID or 컨테이너이름
- 컨테이너 생성 (CREATE)
  - docker create -p 80:80 --name nx nginx
  - 서비스내의 80포트를 80으로 포트포워딩하고, 컨테이너 이름은 nx로 만들고, nginx 이미지를 사용한다.
- 컨테이너 RUN (RUN - PULL, CREATE, START 를 한번에 하는 명령어)
  - docker run -d -p 80:8080 --name tc consol/tomcat-7.0
  - 컨테이너 이름은 tc로 만들고, consol/tomcat-7.0 이미지를 사용하여 백그라운드로 실행한다.
  - consol/tomcat-7.0 서비스의 8080포트를 80포트로 포트포워딩
- 컨테이너 삭제 (RM) : docker rm 컨테이너ID or 컨테이너이름
- 실행중인 컨테이너 확인 : docker ps
- 모든 컨테이너 확인 : docker ps -a
- 모든 컨테이너 ID만 확인 : docker ps -a -q
- 모든 컨테이너 중지 : docker stop \`docker ps -a -q\`
- 모든 컨테이너 삭제 : docker rm \`docker ps -a -q\`

### 컨테이너 설정

- 컨테이너 내부 shell 실행 : docker exec -it 컨테이너이름 /bin/bash
- 컨테이너 로그 확인(stdout, stderr) : docker logs 컨테이너이름
- 호스트 및 컨테이너 간 파일 복사
  - docker cp 호스트path 컨테이너이름:path
  - docker cp 컨테이너이름:path 호스트path
  - docker cp 컨테이너이름:path 컨테이너이름:path
- 컨테이너 실행시 환경변수 설정
  - docker run --name ms -e MYSQL_ROOT_PASSWORD=pw -d mysql
  - -e 옵션으로 환경변수 MYSQL_ROOT_PASSWORD를 pw값으로 설정
  - docker shell 접속하여 printenv로 확인
- 컨테이너 Commit
  - 작업한 컨테이너를 이미지로 저장
  - docker commit 컨테이너이름 이미지이름
  - docker commit ubuntu-cpp-container ubuntu-cpp-image
