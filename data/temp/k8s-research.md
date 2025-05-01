---
title: Kubernetes research
date: '2025-4-19'
tags: ['k8s', 'ci', 'cd']
draft: false
summary: ''
---

# 목차

- [Node region setting](#node-region-setting)
- [Pod stable running](#pod-stable-running)
  + [1. TopologySpreadConstraint](#1-topologyspreadconstraint)
  + [2. Pod Disruption Budget (PDB)](#2-pod-disruption-budget-pdb)
  + [3. Horizontal Pod Autoscaler (HPA)](#3-horizontal-pod-autoscaler-hpa)
  + [4. Vertical Pod Autoscaler (VPA)](#4-vertical-pod-autoscaler-vpa)
- [Liveness, Readiness Probes](#liveness-readiness-probes)
  + [Liveness probe](#liveness-probe)
  + [Readiness probe](#readiness-probe)
  + [Configurable values](#configurable-values)
  + [Checkpoint](#checkpoint)
  + [Graceful shutdown](#graceful-shutdown)
- [Canary](#canary)
  + [1. Deployment 와 Service 리소스 만 사용하는 기본적인 방법](#1-deployment-와-service-리소스-만-사용하는-기본적인-방법)
  + [2. Ingress Nginx 를 사용하고 있는 경우](#2-ingress-nginx-를-사용하고-있는-경우)
  + [3. Argocd 를 이용하는 방법](#3-argocd-를-이용하는-방법)

<br />

# Node region setting

K8S Node 를 여러 region 으로 분배하여 설치시에 장단점은 다음과 같다.

* 장점
  * 고가용성
  * 재해복구
* 단점
  * region 간에 지연 시간 문제

Region 세팅의 경우 주사용자의 위치와 가까운 region를 선택하고 해당 region 안에 seoul-1,2,3(예시)으로 서버를 분배해두면 고가용성을 가지면서도 지연 시간 문제를 최소화 할 수 있습니다.

<br />

# Pod stable running

## 1. TopologySpreadConstraint

**파드를 노드(또는 특정 영역/그룹)에 균등하게 분산처리하는 방법**

* 장점
  * 리소스 균등 분배
  * 가용성 향상
* 단점
  * 작은 클러스터에서는 제약 조건 충족이 어려울 수 있음

* 적용이 필요한 상황
  * 특히나 3개 이상의 노드 및 다수의 파드를 활용하는 환경에서는 해당 옵션을 통해 파드의 분산처리를 진행하는 것이 권장됩니다.
  * 파드 분산처리가 되어 있지 않으면, 특정 노드에 대한 장애 상황 및 노드 단위의 유지보수 과정 중에서 다수의 파드가 한번에 종료될 수 있습니다.

#### How to Apply

PodSpec 하위에 정의됩니다.

```yaml
topologySpreadConstraints:
  - maxSkew: <분산 최대 오차>
    topologyKey: <분산 대상 topology key>
    whenUnsatisfiable: <ScheduleAnyway|DoNotSchedule>
    labelSelector:
      matchLabels:
        <대상 pod label>
```

아래 테스트에서 hostname을 기준으로 분산했기 때문에 모두 다른 노드에 9개 파드가 생성된다.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: topology-spread-demo
  namespace: tsc-test
spec:
  replicas: 9
  selector:
    matchLabels:
      app: topology-test
  template:
    metadata:
      labels:
        app: topology-test
    spec:
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: kubernetes.io/hostname
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels:
              app: topology-test
      containers:
        - name: nginx
          image: nginx
          resources:
            requests:
              cpu: 0.5
              memory: 1Gi
            limits:
              cpu: 0.5
              memory: 1Gi
```

참고 : https://techblog.lycorp.co.jp/ko/using-topology-spread-constraints-to-spread-out-pods

## 2. Pod Disruption Budget (PDB)

**유지보수 또는 장애시에도 최소한의 파드 수를 보장하여 서비스 가용성 확보**

* 장점
  * 다운타임 최소화
  * 서비스 안정성 보장
* 단점
  * 유지보수 작업이 느려질 수 있음 

* 적용이 필요한 상황
  * 운영되는 서비스의 최소한의 pod 개수를 보장하는 설정이므로 적용하는 것이 권장됩니다.
  * 일부 노드에 대한 장애 상황 또는 노드 단위의 유지보수 과정 중에서 예기치 않게 파드를 종료시키려 하더라도, 해당 설정을 통해 최소한의 파드가 운영되도록 설정할 수 있습니다.

#### How to Apply

PodDisruptionBudget resource를 정의 합니다.

* minAvailable 을 통해 최소한으로 운영되는 Pod개수를 정의합니다.

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: pdb-demo
  namespace: pdb-test
spec:
  minAvailable: 4
  selector:
    matchLabels:
      app: pdb-test
```

위와 같이 설정시, 아래와 같이 동작.

1. 6개 pod가 2개의 Node에서 기동되고 있는 상태
2. 해당 상태에서 1개 노드를 rebuild 처리 시도 -> 1개 노드가 rebuild되면 pod가 3개밖에 기동이 되지 않기에, 노드가 rebuild되면 안됨 (다른 노드에는 resource 부족으로 신규 pod가 생성되지 않음)
3. PDB는 최소 4개의 파드를 요구하기 때문에, 3개만 실행되는 상황에서는 더 이상 파드를 종료할 수 없습니다. 따라서, 노드 리빌드 시도가 실패합니다. PDB가 파드를 강제로 종료하지 않도록 보호합니다.
4. rebuild를 시도한 노드는 cordon 상태가 됩니다. 그리고 drain 되지 못한 상태로 남아있습니다. (cordon, drain 상태에 대해서는 아래 참조)

* Cordon
  * 기능: 노드를 cordon 상태로 설정하면, 해당 노드에 새로운 파드를 스케줄링하지 않도록 합니다.
  * 사용 목적: 유지보수 작업을 위해 노드를 준비할 때 유용합니다. 기존 파드는 계속 실행되지만, 새로운 파드는 해당 노드에 배치되지 않습니다.

* Drain
  * 기능: 노드를 drain하면, 해당 노드에서 실행 중인 모든 파드를 안전하게 종료하고, 다른 노드로 이동시킵니다.
  * 사용 목적: 노드를 유지보수하거나 교체할 때, 파드를 안전하게 다른 노드로 옮기기 위해 사용합니다.

## 3. Horizontal Pod Autoscaler (HPA)

**트래픽 증가 시 파드 수를 자동 확장하여 부하 분산**

* 장점
  * 유연한 확장성
  * 비용 효율성
* 단점
  * 실시간 대응 지연
  * 설정이 복잡할 수 있음

* 적용이 필요한 상황
  * 적용 공수가 크지 않고, 일반적으로 많이 사용하는 항목이기에 적용해두는 것을 권장합니다.
  * 다만, 갑작스럽게 트래픽이 몰리는 스파이크 현상에 대해서는 HPA가 대응하지 못하기 때문에, 실질적인 도움을 받지 못할 수 있습니다.
  * HPA는 빠르지 않게 증가되는 트래픽부하에 대해 효과적이므로, 스파이크 트래픽에 대해서는 별도의 방안을 고려해야 합니다.

## 4. Vertical Pod Autoscaler (VPA)

**파드의 리소스(CPU, Memory)를 자동 조정하여 자원 효율성 최적화**

* 장점
  * 안정적 리소스 할당
  * 비용 절감
* 단점
  * 리소스 조정시 파드 재기동 필요 

* 적용이 필요한 상황
  * 해당 옵션을 적용하더라도, 'updateMode'는 Initial/Off 둘 중 하나로만 설정하여, 권장 사항을 참고하는 용도로만 사용하는 것을 권장합니다.
  * Auto/Recreate 로 적용하게 되면 권장 사항에 따라 pod가 자동으로 재시작될 수 있기에, 오히려 리스크가 될 수 있습니다.

<br />

# Liveness, Readiness Probes

### Liveness probe

* 정의
  * Liveness probe는 컨테이너가 정상적으로 작동하고 있는지를 확인하는 프로브입니다.
  * 컨테이너가 Deadlock에 빠지거나, 내부 오류로 인해 더 이상 요청을 처리할 수 없는 경우를 감지하여 Kubernetes(Kubelet)가 해당 컨테이너를 재시작할 수 있도록 합니다.
* 작동 원리
  * Liveness probe는 주기적으로 컨테이너의 상태를 확인합니다. Liveness probe가 실패하면 Kubernetes는 해당 컨테이너를 재시작(self-healing)합니다.
* 구성 방법
  * HTTP GET
    * 컨테이너의 HTTP endpoint로 GET 요청을 수행하며, HTTP 응답 코드가 2xx, 3xx인 경우 probe가 성공했다고 간주합니다.
    
```yaml
livenessProbe:
  httpGet:
    path: /livenessState
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 2
  failureThreshold: 3
```

  * TCP Socket
    * 컨테이너의 지정된 port로 TCP 연결을 시도하고, 연결에 성공하면 probe가 성공했다고 간주합니다.

```yaml
livenessProbe:
  tcpSocket:
    port: 3306
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 2
  failureThreshold: 3
```

  * Exec Command
    * 컨테이너 내에서 명령을 실행하고 명령의 exit code가 0이면 probe가 성공했다고 간주합니다. 

```yaml
livenessProbe:
  exec:
    command:
    - cat
    - /tmp/liveness
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 2
  failureThreshold: 3
```

### Readiness probe

* 정의
  * Readiness probe는 컨테이너가 트래픽을 처리할 준비가 되었는지를 확인하는 프로브입니다.
  * 애플리케이션이 초기화 중이거나, 외부 서비스에 의존하고 있어 준비가 되지 않은 경우를 감지하여 Kubernetes가 해당 컨테이너에 대한 트래픽을 라우팅하지 않도록 합니다.
* 작동 원리
  * Liveness probe와 마찬가지로 Readiness probe도 주기적으로 컨테이너의 준비 상태를 확인합니다. Readiness probe가 실패하면 Kubernetes는 해당 컨테이너에 대한 트래픽을 라우팅하지 않으며, 이는 애플리케이션이 준비되지 않은 상태에서 트래픽을 받지 않도록 합니다.
* 구성 방법
  * 위의 Liveness probe 와 같은 방식으로 구성할 수 있습니다. ( 사용하는 Configurable values 도 동일 )

### Configurable values

* initialDelaySeconds
  * 컨테이너가 시작된 후, liveness/readiness probe가 처음 실행되기까지 대기할 시간(초)입니다.
  * **애플리케이션이 초기화되는 데 시간이 걸리는 경우, 초기화가 완료될 때까지 probe가 실행되지 않도록 설정합니다.**
  * Liveness probe에서 initialDelaySeconds
    * **초기화 중인 애플리케이션이 잘못된 상태로 간주되어 재시작되는 것을 방지할 수 있습니다. - 무한 재시작에 빠질 수 있음**
  * Readiness probe에서 initialDelaySeconds
    * 이 필드가 직접적으로 컨테이너의 재시작에 영향을 미치지는 않습니다. 
* periodSeconds
  * Liveness/Readiness probe가 주기적으로 수행되는 간격(초)입니다. - 적절히 설정하여 컨테이너에 많은 부하를 주는 것을 방지
* timeoutSeconds
  * Liveness/Readiness probe가 타임아웃되기까지의 시간(초)입니다. 이 시간 내에 probe가 응답하지 않으면 실패로 간주하며, **네트워크 지연이나 애플리케이션의 응답 시간을 고려하여 설정**해야 합니다.
* successThreshold
  * Liveness/Readiness probe가 성공으로 간주되기 위한 연속 성공 횟수입니다.
* failureThreshold
  * Liveness/Readiness probe가 실패로 간주되기 위한 연속 실패 횟수입니다.
  * Liveness probe에서 failureThreshold
    * 이 값에 도달하면 컨테이너가 재시작됩니다. **일시적인 오류로 인한 불필요한 재시작을 방지하기 위해 적절한 값을 설정해야 합니다.**
* terminationGracePeriodSeconds
  * 애플리케이션이 완전하게 종료될 때까지 기다리는 시간입니다. 이 시간이 지났음에도 여전히 애플리케이션이 살아있다면, kubelet은 애플리케이션에게 SIGKILL signal을 보냅니다.
  * Pod-level로 설정할 수도 있고 liveness probe에 probe-level로 설정할 수도 있습니다. 둘 다 설정한다면 pod-level보다 probe-level이 우선합니다.

### Checkpoint

* HTTP API 경량화
  * Liveness/Readiness probe가 호출할 HTTP API는 HTTP 200을 응답하도록 하게끔 매우 가볍게 만들 수 있습니다. 반면에 애플리케이션에서 사용하는 주요 구성 요소가 살아있는지 확인하도록 구성할 수도 있습니다. 만약 주요 구성 요소가 살아있는지 확인하도록 한다면 그것이 너무 많은 컴퓨팅 리소스를 소모하지는 않는지 확인이 필요하고, probe에서 너무 많은 일을 하게 되면 컨테이너의 속도를 느리게 만들 수 있습니다.
* 인증 확인
  * 애플리케이션에서 API에 인증을 적용되어 있는 경우, liveness/readiness probe가 호출할 HTTP API 또한 인증을 필요로 하는 것인지 확인이 필요합니다. Liveness probe의 경우 probe에 계속 실패하게 되면 컨테이너가 무한정 재시작될 수도 있습니다.
* 트래픽 제어(throttling) 확인
  * 애플리케이션에 유입되는 트래픽을 제어하기 위해 throttling 설정이 되어 있다면, 이것이 liveness/readiness probe가 호출할 HTTP API에 영향이 있는 것은 아닌지 확인이 필요합니다. ( 해당 API 는 예외처리가 되어야 합니다. )
* 적절한 initialDelaySeconds  설정
  * 애플리케이션의 성격에 맞게 적당한 initialDelaySeconds 설정이 필요합니다. 이를 설정하지 않으면 컨테이너가 시작되자마자 liveness/readiness probe가 시작됩니다. 이 경우 애플리케이션이 아직 준비가 되지 않아 즉시 실패할 수 있고, 특히 liveness probe의 경우 liveness state가 UP으로 되기 전에 failureThreshold만큼 연속으로 실패하면 최종 liveness probe 실패로 간주해 컨테이너가 무한정 재시작될 수 있습니다.
* 간격 설정
  * Liveness/Readiness probe 간격이 너무 짧거나 길지는 않은지 확인해볼 필요가 있습니다.
    * Probe 간격이 너무 짧을 때
      * 애플리케이션과 Kubernetes 클러스터에 불필요한 부하를 줄 수 있습니다. 특히, probe에서 복잡한 작업을 수행하는 경우 CPU 리소스를 과하게 소모할 수 있고, 만약 외부 서비스와의 통신을 포함하는 경우 네트워크 리소스에 부하를 줄 수 있습니다.
      * 일시적인 네트워크 지연이나 순간적인 성능 저하로 인해 probe가 실패할 수 있는데, 간격이 너무 짧은 경우 이러한 일시적인 문제로 컨테이너가 불필요하게 자주 재시작될 수 있습니다.
      * 문제 상황이 발생했을 때 너무 잦은 probe로 인해 발생한 로그로 문제의 근본 원인을 파악하기 어렵게 할 수도 있습니다. Probe에서 호출하는 API는 액세스 로그에 적재하지 않는 것도 고려해볼 수 있습니다.
    * Probe 간격이 너무 길 때
      * 애플리케이션의 문제를 감지하고 대응하는 데 시간이 오래 걸릴 수 있고, 이는 서비스 가용성에 부정적인 영향을 미칠 수 있습니다.
      * 애플리케이션이 비정상 상태에 빠졌을 때, probe의 긴 간격으로 해당 상태가 장시간 지속될 수 있습니다.
* 재시도 로직 불필요
  * Liveness/Readiness probe 실패시 Kubernetes에서 periodSeconds와 failureThreshold에 대해 자동으로 재시도하기 때문에 애플리케이션 코드에 별도의 재시도 로직을 추가할 필요가 없습니다.
* 트래픽 수신 준비
  * Readiness probe는 애플리케이션이 트래픽을 받을 준비가 되었는지를 확인하는데에 사용할 수 있는데, 애플리케이션의 warmup이 충분히 수행된 이후에 준비 상태로 변경되는지 확인해볼 필요가 있습니다.

### Graceful shutdown

Kubernetes는 분산 시스템의 특성상 여러 서브시스템이 동시에 종료 프로세스를 처리합니다. 이 과정에서 endpoint controller 업데이트, kube-proxy의 iptables 규칙 업데이트, load balancer 업데이트, shutdown hook 실행 등의 작업들이 병렬로 실행될 수 있는데, 이로 인해 종료 프로세스가 시작된 pod로 트래픽이 라우팅될 수 있는 짧은 시간이 발생할 수 있습니다. 아래 이미지를 보면, pod 종료 요청에 대해 두 작업 흐름이 동시에 수행되는 것을 알 수 있습니다. 여기서, 애플리케이션이 종료된 이후에도 연결 요청이 전달될 수 있고, 실제로 애플리케이션은 종료된 상태이기 때문에 connection refused 오류가 발생합니다.

<img src="/static/images/graceful-shutdown1.png" />

이를 방지하기 위해 container lifecycle 중 preStop 핸들러에서 아래와 같이 sleep 명령을 실행하도록 설정할 수 있는데, 이 sleep 명령은 새로운 요청이 해당 pod로 라우팅되지 않도록 충분한 시간 동안 대기하게 합니다. 아래 이미지를 보면, preStop hook에 일정 시간동안 대기하도록 했을 때 iptables 업데이트가 모두 완료된 이후에 애플리케이션이 안전하게 종료되는 것을 알 수 있습니다.

<img src="/static/images/graceful-shutdown2.png" />

```yaml
spec:
  containers:
  - name: "example-container"
    image: "example-image"
    lifecycle:
      preStop:
        exec:
          command:
            - sh
            - -c
            - sleep 10
```

그리고 만약 preStop hook을 완료하는 데에 오랜 시간이 필요한 경우 이에 맞게 terminationGracePeriodSeconds(기본 값 30초)를 수정할 필요가 있습니다.

terminationGracePeriodSeconds timer는 preStop hook이 호출될 때 혹은 preStop hook이 없는 경우 SIGTERM signal이 전송될 때 시작되며, terminationGracePeriodSeconds 만료 이후에도 프로세스가 계속 실행 중이면 SIGKILL signal을 통해 강제로 종료됩니다.

<img src="/static/images/graceful-shutdown3.png" />

terminationGracePeriodSeconds에는 preStop hook의 수행 시간과 애플리케이션이 SIGTERM signal을 받은 이후에 종료되는 과정 모두가 포함되기 때문에 이를 고려해서 terminationGracePeriodSeconds를 설정할 필요가 있습니다.

참고
* https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
* https://docs.spring.io/spring-boot/how-to/deployment/cloud.html#howto.deployment.cloud.kubernetes.container-lifecycle
* https://wangwei1237.github.io/Kubernetes-in-Action-Second-Edition/docs/Understanding_the_pod_lifecycle.html

<br />

# Canary

팀에서 서비스를 Legacy 버전에서 새로운 버전으로의 내재화 작업을 진행하고 있습니다. <br />
새로운 버전의 변경 내용을 제한된 사용자들 일부분에게만 먼저 배포하여 문제점을 조기에 발견하고 해결하기 위해 Canary 배포 도입에 대해 조사를 하였습니다

### 1. Deployment 와 Service 리소스 만 사용하는 기본적인 방법

이 방법은 Kubernetes 의 기본 기능만을 사용하는 경우에 유효한 방법 입니다. <br />
Kubernetes 에서의 일반적인 관행은 여러 Label 을 이용하여 동일한 구성 요소의 서로 다른 릴리스를 배포하는 것 입니다. <br />
이를 이용해서 특정 image tag를 지정한 새 어플리케이션 릴리즈 버전에 해당하는 Cnanary 를 이전 릴리즈 버전들과 나란히 배포하여 이전 릴리즈가 완전히 롤아웃이 되기 전에 traffic 을 수신할 수 있도록 하는 방법 입니다.

참고 : https://kubernetes.io/docs/concepts/workloads/management/#canary-deployments

<img src="/static/images/canary1.png" />

* 안정적인 버전과 Canary 버전, 2 개의 Deployment 를 배포합니다. 이때 2개의 Deployment 는 동일한 매칭을 위한 label (app: myapp) 을 가집니다.
* 두 Deployment 의 Pod 에 트래픽을 전달 분산하기 위한 Service 를 정의합니다. 이 Sertvice 는 두 버전의 Pod 에 모두 트래픽을 라우팅하기 위해 selector 로 두 Deployment 의 공통 라벨 (app: myapp) 을 지정합니다.
* 위 설정에 의해 Service 로 전달되는 트래픽은 Replica 수로 관리합니다. 위에서는 Service 는 5개의 Pod 에 트래픽을 분산할 것이며 이중 4/5 는 myapp-stable 로, 1/5 는 myapp-canary 로 라우팅 됩니다.
* kubernetes 의 기본 로드 밸런싱은 라운드 로빈 방식이다. 따라서 트래픽 분배는 Pod 의 수에 따라 자동으로 분배 되므로, 트래픽 비율을 맞추기 위해서는 Replica 수를 조정할 필요가 있습니다.

### 2. Ingress Nginx 를 사용하고 있는 경우

<img src="/static/images/canary2.png" />

참고 : https://kubernetes.github.io/ingress-nginx/examples/canary/#canary

* Ingress Nginx 는 HTTP, HTTPS 트래픽을 관리하고 라우팅 하기 위한 오픈소스 Ingress 컨트롤러 이다.
* Ingress 리소스를 통해 외부 트래픽을 클러스터 내부의 서비스로 라우팅 하는 역활을 한다.

1 Stable Deployment & Service

```yaml
---
# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: production
  labels:
    app: production
spec:
  replicas: 1
  selector:
    matchLabels:
      app: production
  template:
    metadata:
      labels:
        app: production
    spec:
      containers:
      - name: production
        image: xxx
        ports:
        - containerPort: 80
        env:
          - name: NODE_NAME
            valueFrom:
              fieldRef:
                fieldPath: spec.nodeName
          - name: POD_NAME
            valueFrom:
              fieldRef:
                fieldPath: metadata.name
          - name: POD_NAMESPACE
            valueFrom:
              fieldRef:
                fieldPath: metadata.namespace
          - name: POD_IP
            valueFrom:
              fieldRef:
                fieldPath: status.podIP
---
# Service
apiVersion: v1
kind: Service
metadata:
  name: production
  labels:
    app: production
spec:
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
    name: http
  selector:
    app: production
```

2 Canary Deployment & Service

```yaml
---
# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: canary
  labels:
    app: canary
spec:
  replicas: 1
  selector:
    matchLabels:
      app: canary
  template:
    metadata:
      labels:
        app: canary
    spec:
      containers:
      - name: canary
        image: xxx
        ports:
        - containerPort: 80
        env:
          - name: NODE_NAME
            valueFrom:
              fieldRef:
                fieldPath: spec.nodeName
          - name: POD_NAME
            valueFrom:
              fieldRef:
                fieldPath: metadata.name
          - name: POD_NAMESPACE
            valueFrom:
              fieldRef:
                fieldPath: metadata.namespace
          - name: POD_IP
            valueFrom:
              fieldRef:
                fieldPath: status.podIP
---
# Service
apiVersion: v1
kind: Service
metadata:
  name: canary
  labels:
    app: canary
spec:
  ports:
  - port: 80
    targetPort: 80
    protocol: TCP
    name: http
  selector:
    app: canary
```

3 Stable Deployemnt 를 Ingress 리소스 로 노출한다. 이때, Canary Annoation 은 지정하지 않는다.

```yaml
---
# Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: production
  annotations:
spec:
  ingressClassName: nginx
  rules:
  - host: echo.prod.mydomain.com
    http:
      paths:
      - pathType: Prefix
        path: /
        backend:
          service:
            name: production
            port:
              number: 80
```

4 Canary Deployment 를 위한 Ingress 리소스를 노출한다. 

* Host Name 은 Main Ingress Host Name 과 동일해야한다.
* nginx.ingress.kubernetes.io/canary: "true" Annotation 이 필요하며 이를 Canary Annotation 으로 정의한다 (이 Annotation 없으면 Main Ingress 와 충돌한다).

```yaml
---
# Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: canary
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "50"
spec:
  ingressClassName: nginx
  rules:
  - host: echo.prod.mydomain.com
    http:
      paths:
      - pathType: Prefix
        path: /
        backend:
          service:
            name: canary
            port:
              number: 80
```

### 3. Argocd 를 이용하는 방법

참고 : https://argo-rollouts.readthedocs.io/en/stable/features/traffic-management/#traffic-management

좀 더 Canary 배포를 보다 효율적이고 자동화된 방식으로 관리하기 위해서 ArgoCD 의 Rollouts 리소스를 함께 사용할 수도 있다.

* Argocd 에서는 Rollout 이라는 리소스를 통해 traffic management (== Canary) 를 지원한다.
* Rollout Object 는  traffic providers (Istio, Ingress Nginx etc..) 를 추가적으로 지원하여 트래픽 관리를 할 수 있도록 지원해 준다.
* Rollout Object 에는 traffic providers 에 따라 그 상세 설정 방법이 나뉘지만, 일반적으로는 아래와 같이 Canary Service 와 stable Service 를 지정 한다.

<img src="/static/images/graceful-shutdown3.png" />

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
spec:
  ...
  strategy:
    canary:
      canaryService: canary-service
      stableService: stable-service
      trafficRouting:
       ...
```

* Rollout Controller 는 롤아웃이 진행됨에 따라 적절한 Canary, Stable Replicaset 으로 트래픽을 라우팅 하도록 서비스를 자체적으로 수정한다. 이러한 서비스들은 각종 Service Mesh 로 하여금 Canary와 Stable 트래픽을 수신해야하는 Pod 그룹을 정의하는데 사용된다.

그 외 [istio](https://istio.io/) 와 [Flagger](https://flagger.app/) 를 이용한 Canary 배포 방법도 있습니다. 