---
title: Docker 이미지 빌드하고 Push하기
date: '2020-11-11'
tags: ['docker', 'ci']
draft: false
summary: 'Docker 레지스트리 | 이미지 Layer | 이미지 빌드 해보기 | 이미지 푸시'
---

### Docker 레지스트리

Docker 레지스트리에는 사용자가 사용할 수 있도록 데이터베이스를 통해 Image를 제공해주고 있음.

누구나 이미지를 만들어 푸시할 수 있으며 푸시된 이미지는 다른 사람들에게 공유 가능

https://hub.docker.com/ 에서 이미지 검색 가능

### 이미지 Layer

Docker 이미지는 여러개의 Layer로 구성되어 있다.

기존 이미지에 파일을 추가하여 새로운 이미지를 만든다면, 이미지 전체를 다시 다운로드 받지 않고 추가되는 파일에 대한 Layer만 새로 생성하면 된다.

만약 Layer A 를 사용하는 특정 이미지를 삭제해도 해당 Layer를 사용하는 다른 이미지가 있다면 Layer A는 지워지지 않는다.

즉 이미지 내의 레이어를 중복으로 내려받지 않아서 적은 용량으로 효율적으로 이미지를 관리할 수 있다.

![object](/static/images/docker-image-layer.png 'object')

### Docker 이미지 빌드 해보기

1. 테스트 Application 작성 (Recv 한 내용을 Client에게 다시 보내는 간단한 서버)

```
# test_server.py
import socket

with socket.socket() as s:
    s.bind(("0.0.0.0", 12345))
    s.listen()
    print("server is started")
    conn, addr = s.accept()
    # conn 클라이언트와 통신할 소켓
    # addr 클라이언트의 정보가 들어있음
    with conn:
        print("Connected by", addr)
        while True:
            data = conn.recv(1024)
            if not data: break
            conn.sendall(data)
```

2. 도커 파일 생성

```
mkdir my_first_project
mv test_server.py ./my_first_project
cd my_first_project
gedit dockerfile
```

3. dockerfile 작성

```
FROM python:3.7

RUN mkdir /echo
COPY test_server.py /echo

CMD ["python", "/echo/test_server.py"]
```

- python 3.7 이미지를 사용
- echo 디렉토리를 만듬
- test_server.py 를 echo로 복사
- CMD : 컨테이너가 실행될 때 실행할 명령어 정의 (RUN과의 차이는 RUN은 이미지를 빌드할 때 실행된다.)

4. 빌드 후 테스트

```
ls
dockerfile test_server.py

sudo docker build -t echo_test .
sudo docker images
sudo docker run -d -p 12345:12345 --name echo_test echo_test

nc 127.0.0.1 12345
```

- 현재 디렉토리에 있는 dockerfile을 읽어서 echo_test 라는 이름으로 이미지를 빌드
- 빌드한 echo_test 이미지를 가지고 컨테이너 실행
- test_server에 접속

### Docker 이미지 푸시 (Registry에 업로드)

```
sudo docker login
sudo docker tag echo_test 아이디/echo_test
sudo docker images
sudo docker push 아이디/echo_test
```

- https://hub.docker.com 에서 가입하여 도커 로그인
- 생성한 이미지 이름, 태그 변경
- 이미지 리스트 확인
- Push
