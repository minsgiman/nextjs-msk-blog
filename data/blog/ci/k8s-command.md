---
title: Kubernetes 커맨드
date: '2023-1-2'
tags: ['k8s', 'ci']
draft: false
summary: 'kubeconfig 파일은 k8s의 설정 파일로, kubectl 명령어로 apiserver에 접근할 때 사용할 인증정보를 담고 있다.'
---

## kubeconfig 설정

[kubeconfig](https://kubernetes.io/ko/docs/concepts/configuration/organize-cluster-access-kubeconfig/) 파일은 k8s의 설정 파일로, `kubectl`명령어로 apiserver에 접근할 때 사용할 인증정보를 담고 있다.

kubeconfig 파일의 위치는 `~/.kube/config` 에 둔다.

> 기본적으로 kubectl은 $HOME/.kube 디렉터리에서 config라는 이름의 파일을 찾는다. KUBECONFIG 환경 변수를 설정하거나 --kubeconfig 플래그를 지정해서 다른 kubeconfig 파일을 사용할 수 있다.

다른 경로의 파일을 사용하려면 다음 명령어로 KUBECONFIG 환경변수를 설정한다.

```shell
$ export KUBECONFIG=$HOME/kubeconfig_mskang.yaml
```

## Pod, namespace 조회

| 설명                                            | command                                  |
| ----------------------------------------------- | ---------------------------------------- |
| 네임스페이스 리스트                             | kubectl get ns                           |
| 현재 네임스페이스의 pod 리스트                  | kubectl get pods                         |
| 현재 네임스페이스의 pod 리스트 (with 상세 정보) | kubectl get pods -o wide                 |
| hey-cookie 네임스페이스의 pod 리스트            | kubectl get -n hey-cookie pods           |
| hubot-hey-cookie pod 대상 yaml 출력             | kubectl get pod hubot-hey-cookie -o yaml |
| hubot-hey-cookie pod 상세 정보                  | kubectl describe pod/hubot-hey-cookie    |
| List all pods with labels                       | kubectl get pods --show-labels           |

## Deployment 커맨드

deployment 리스트 조회

```shell
$ kubectl get deployments
```

deployment 스케일링

```shell
// yaml 파일을 직접 수정하여 replicas 수를 조정
$ kubectl edit deploy ${deployment_name} 

// 명령을 사용해 replicas 수 조정
$ kubectl scale deploy ${deployment_name} --replicas=${number}
```

deployment 이력조회

```shell
$ kubectl rollout history deployment/${deployment_name}
```

deployment 버전 세부정보 조회

```shell
$ kubectl rollout history deployment/${deployment_name} --revision=2
```

이전 버전으로 롤백

```shell
$ kubectl rollout undo deployment/${deployment_name} --to-revision=2
```

## Deployment의 Pod 재시작

#### 1. Scale

```shell
$ kubectl scale deployment ${deployment_name} --replicas=0
```

이렇게 해서 pod를 끈다. 그리고 다시 아래와 같이 하면 재시작된다.

```shell
$ kubectl scale deployment ${deployment_name} --replicas=1
```

#### 2. Rolling Restart

```shell
$ kubectl rollout restart deployment ${deployment_name}
```

## Pod delete

참고 : https://jamesdefabia.github.io/docs/user-guide/kubectl/kubectl_delete/

deployment -> pods 생성했다면, pod 먼저 삭제하면 다시 실행되기 때문에.. deployment를 먼저 지우고, pod를 지운다.

```shell
$ kubectl delete deployment hubot-server
deployment.extensions "hubot-server" deleted

$ kubectl delete pods hubot-hey-cookie
pod "hubot-hey-cookie" deleted
```

## 동작중인 컨테이너의 셸에 접근하기

참고 : https://kubernetes.io/ko/docs/tasks/debug/debug-application/get-shell-running-container/

```shell
$ kubectl exec --stdin --tty ${pod_name} -- /bin/bash
```

사용하는 linux 시스템에 따라 /bin/bash 대신에 /bin/sh 를 사용해야 할 수도 있다.

## 모든 kubectl 명령에서 사용하는 기본 namespace 설정

참고 : https://kubernetes.io/ko/docs/concepts/overview/working-with-objects/namespaces/

```shell
$ kubectl config set-context --current --namespace=<insert-namespace-name-here>
```

## 에러시 로그 확인

에러시에 다음의 커맨드로 pod 상세정보와 로그를 확인한다.

```shell
$ kubectl describe pods
$ kubectl logs -f ${pod_name}
```

다음과 같이 특정 시간 이내의 로그를 확인할 수도 있다.

```shell
$ kubectl logs -f ${pod_name} --since=10h
```

## Secret 생성

다음 명령을 사용하여 `slack-bot-token` 이라는 name의 `SLACK_BOT_TOKEN: <your-hubot-api-token>` 데이터를 가지는 secret을 namespace에 생성할 수 있다.

```shell
cat << EOF | kubectl create -n <your-namespace> -f -
apiVersion: v1
kind: Secret
metadata:
  name: slack-bot-token
type: Opaque
stringData:
  SLACK_BOT_TOKEN: <your-hubot-api-token>
EOF
```

그러면 아래와 같이 env에 `SLACK_BOT_TOKEN_NAME` 를 설정할 때 위에서 생성한 `slack-bot-token` secret의 `SLACK_BOT_TOKEN` key로부터 value를 가져올 수 있다. <br />
그리고 node 앱에서 `process.env.SLACK_BOT_TOKEN_NAME` 로 해당 secret value를 사용한다.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hubot-hey-cookie
spec:
  replicas: 1
  template:
    metadata:
      name: hubot-hey-cookie
    spec:
      containers:
        - name: hubot-hey-cookie
          image: hubot-hey-cookie
          imagePullPolicy: IfNotPresent
          env:
            - name: SLACK_BOT_TOKEN_NAME
              valueFrom:
                secretKeyRef:
                  name: slack-bot-token
                  key: SLACK_BOT_TOKEN
            - name: MONGODB_ID
              valueFrom:
                secretKeyRef:
                  name: mongodb-id
                  key: MONGODB_ID
            - name: MONGODB_PWD
              valueFrom:
                secretKeyRef:
                  name: mongodb-pwd
                  key: MONGODB_PWD
          resources:
            limits:
              cpu: 2
              memory: 2Gi
            requests:
              cpu: 1
              memory: 1Gi
      restartPolicy: Always
```

secret과 create에 대한 자세한 설명은 다음을 참고한다. <br />

- [secret](https://kubernetes.io/ko/docs/tasks/inject-data-application/distribute-credentials-secure/)
- [create](https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#create)

---

### 참고

- https://enumclass.tistory.com/136

- https://kubernetes.io/ko/docs/reference/kubectl/cheatsheet/

- https://kubernetes.io/ko/docs/reference/
