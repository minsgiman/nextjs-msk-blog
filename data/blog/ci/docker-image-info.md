---
title: Docker 이미지 정보 확인
date: '2019-02-06'
tags: ['docker', 'ci']
draft: false
summary: 'Docker 이미지 정보, 변경 히스토리, 저장소 위치, 레이어 저장소 확인'
---

- 이미지 정보 확인 : docker inspect 이미지이름
- 이미지 변경 히스토리 확인 : docker history 이미지이름
- 이미지 저장소 위치 확인 : docker info
- 레이어 저장소 확인
  - (1) cd 저장소위치(docker info로 확인)
  - (2) ls
  - (3) cd 저장소위치/image
    - image안에 imagedb는 layerdb에 대한 정보를 가지고 있다. (어떤 layer를 사용하는지)
    - image안에 layerdb는 overlay2에 대한 정보를 가지고 있다. (실제 layer 데이터)
  - (4) cd 저장소위치/overlay2
    - layer 변경사항 들에 대한 정보를 가지고 있다.
    - 대부분의 데이터는 이 안에 있다. (du -sh overlay2 시 사이즈가 가장 큰 것을 확인)
