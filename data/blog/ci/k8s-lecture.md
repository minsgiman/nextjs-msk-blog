---
title: k8s 강의 연습문제 풀기
date: '2023-11-11'
tags: ['k8s', 'ci']
draft: false
summary: ''
---

inflearn [데브옵스 쿠버네티스 마스터 강의](https://www.inflearn.com/course/%EB%8D%B0%EB%B8%8C%EC%98%B5%EC%8A%A4-%EC%BF%A0%EB%B2%84%EB%84%A4%ED%8B%B0%EC%8A%A4-%EB%A7%88%EC%8A%A4%ED%84%B0/dashboard) 연습문제 풀이 기록

yaml 파일은 https://github.com/minsgiman/k8s-test 를 참고한다.

<br />

### [포드](https://kubernetes.io/docs/concepts/workloads/pods/) 연습문제

* yaml을 사용하여 도커이미지 jenkins로 jenkins-manual 포드를 생성하기
* jenkins 포드에서 curl 명령어로 로컬호스트:8080 접속하기
* jenkins 포트를 8888로 포트포워딩 하기
* 현재 jenkins-manual의 설정을 yaml로 출력하기

[kubectl alias 설정 참고](https://happycloud-lee.tistory.com/88)

```
touch jenkins-manual-pod.yaml
kubectl create -f jenkins-manual-pod.yaml
kubectl get pods -w

which kubectl
ln -s /usr/local/bin/kubectl /usr/local/bin/k
vi ~/.bashrc

k exec jenkins-manual -- curl 127.0.0.1:8080 -s
k port-forward jenkins-manual 8888:8080
k logs jenkins-manual
k get pod jenkins-manual -o yaml
k describe pod jenkins-manual
```

<br />

### [디플로이먼트](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/) 연습문제

* 3개의 nginx replicas를 deployment 로 띄우기
* 띄운 ReplicaSet 조회
* 띄운 POD 레이블 확인
* nginx replicas를 5개로 늘리기
* nginx pod 앞단의 service 띄우고, 8000으로 포트포워딩하여 접속해보기

```
k create -f nginx-deploy.yaml
k get all
k describe rs nginx-deployment-86dcfdf4c6
k get pod --show-labels
k scale deploy ${deployment_name} --replicas=5

k create -f service.yaml
k get all
k port-forward service/nginx 8000:80
```

http://localhost:8000 으로 접속하면 nginx로 접속됨을 확인할 수 있다.
