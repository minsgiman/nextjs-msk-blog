---
title: Docker 간단한 설명
date: '2020-11-11'
tags: ['docker', 'ci']
draft: false
summary: 'Docker는 Linux 컨테이너를 만들고 사용할 수 있도록 하는 컨테이너화 기술'
---

### Docker란?

- [Docker](https://www.redhat.com/ko/topics/containers/what-is-docker)는 Linux 컨테이너를 만들고 사용할 수 있도록 하는 컨테이너화 기술
- Application에 국한 되지 않고 의존성 및 파일 시스템까지 패키징하여 빌드, 배포, 실행을 단순화
- 리눅스의 네임 스페이스와 cgroups와 같은 커널 기능을 사용하여 가상화
  - 리눅스 네임 스페이스 : 시스템에 독립적인 공간을 제공하여 파일 시스템 마운트, 네트워크, 유저(uid), 호스트 네임(uts) 등에 대해 네임 스페이스별로 나누어서 관리할 수 있다.
  - 리눅스 컨트롤 그룹(cgroups) : 프로세스로 소비할 수 있는 리소스 양(CPU, 메모리 , I/O, 네트워크 대역대, device 노드)을 나누어 주고 제한한다.
- 가상머신은 하이퍼바이저 위에 각각의 게스트OS를 올리기 때문에 오버헤드가 크다. Docker는 이런 오버헤드 없이 호스트OS 위에 바로 올리기 때문에 빠른 실행 가능

### Docker 이미지와 컨테이너

- 이미지: 컨테이너 실행에 필요한 프로그램과 라이브러리를 설치하고 설정값등을 같이 포함하여 만든 하나의 파일.
- 컨테이너
  - 이미지를 격리하여 독립된 공간에서 실행한 가상 환경 (소프트웨어 컴포넌트가 충돌하거나 다양한 종속성 문제를 해결 가능)
  - 컨테이너는 가상머신처럼 하드웨어를 전부 구현하지 않기 때문에 매우 빠른 실행 가능
  - 프로세스 문제가 발생할 경우 컨테이너 전체를 조정해야 하기 때문에 컨테이너에 하나의 프로세스를 실행하도록 하는 것이 좋다.

### Docker의 한계와 Kubernetes

- 서비스가 커질 수록 관리해야 하는 컨테이너의 양이 급격히 증가
- Docker만으로는 스케일-인, 스케일-아웃이 어려움
- 여러개의 컨테이너 배포 및 배치전략을 관리해줄 수 있는 것이 필요함
- [Kubernetes](https://www.redhat.com/ko/topics/containers/what-is-kubernetes)를 통하여 위의 문제를 해결

---

### 참조

- [Docker(도커)란? 도커 컨테이너 실행 및 사용법](https://www.redhat.com/ko/topics/containers/what-is-docker)

- [쿠버네티스(Kubernetes)란?](https://www.redhat.com/ko/topics/containers/what-is-kubernetes)
