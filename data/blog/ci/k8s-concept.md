---
title: Kubernetes 개념 정리
date: '2023-1-8'
tags: ['k8s', 'ci']
draft: false
summary: '쿠버네티스(Kubernetes)는 컨테이너화 된 애플리케이션의 대규모 배포, 스케일링 및 관리를 간편하게 만들어주는 오픈 소스 기반 컨테이너 오케스트레이션(Container Orchestration) 도구다.'
---

쿠버네티스(Kubernetes)는 컨테이너화 된 애플리케이션의 대규모 배포, 스케일링 및 관리를 간편하게 만들어주는 오픈 소스 기반 컨테이너 오케스트레이션(Container Orchestration) 도구다.

쿠버네티스에 10개의 물리적 서버가 있다면 내가 만든 App은 1번 서버, 다른 개발자의 App은 2번 서버 이렇게 각각 올라가는 것이 아니라 서로 다른 App 모두 같은 물리적 서버를 공유할 수 있어서 한꺼번에 올라가며, 쿠버네티스에 의해 분배, 관리(Container Orchestration) 되는 구조이다.

## Kubernetes Cluster

쿠버네티스를 이루는 구성은 다음과 같다.

**Cluster > Node(WorkerMachine) > Pod(하나이상의 컨테이너화된 Application으로 구성)**

<img src="/static/images/k8s-architecture.jpeg" width="600" />

[쿠버네티스의 Cluster](https://kubernetes.io/ko/docs/concepts/overview/components/)는 Master노드와 Worker노드로 이루어져 있다. <br />

#### Master 노드

워커노드를 모니터링 & 스케쥴링하고 서비스와 pod등을 적재, 관리한다. <br />
마스터노드는 아래와 같은 컴포넌트들을 가지고 있다.

- [Kube-Scheduler](https://kubernetes.io/ko/docs/concepts/overview/components/#kube-scheduler) : Pod, 서비스 등을 적절한 워커노드에 할당
- [kube-controller-manager](https://kubernetes.io/ko/docs/concepts/overview/components/#kube-controller-manager) : Kubernetes Cluster의 모든 Pod들을 관리하는 컨트롤러를 실행하는 역할을 한다.
  - Node Controller : Node가 다운되었을 때 통지와 대응을 한다.
  - Replication Controller : 적절한 수의 Pod를 유지해주는 역할을 한다
  - End-Point Controller : Service와 Pod를 연결해주는 역할을 한다.
  - Service Account / Token Controller : 새로운 namespace에 대한 기본 계정과 API 접근 Token을 생성한다.
- [Kube-ApiServer](https://kubernetes.io/ko/docs/concepts/overview/components/#kube-apiserver) : Kubernetes는 모든 명령과 통신을 API를 이용하며 Kubernetes Cluster의 API를 사용할 수 있도록 하는 서버이다. Cluster로 온 요청을 검증하고 컴포넌트끼리 통신을 주고받을수 있게하는 역할을 한다. kubectl도 내부적으로 api를 호출한다.
- [ETCD](https://kubernetes.io/ko/docs/concepts/overview/components/#etcd) : key-value 저장소(redis같은). 쿠버네티스에서 ETCD에 여러가지 메타데이터를 저장하는데 중요한 것들은 아래와 같다.
  - Node, Pod, 설정, 암호, 계정, 역할

#### Worker 노드

마스터노드에서 스케쥴링 해주는 오브젝트를 적재하며, Pod들을 유지 및 런타임 환경을 제공한다. 워커노드는 아래와 같은 컴포넌트들을 가지고 있다.

- [kubelet](https://kubernetes.io/ko/docs/concepts/overview/components/#kubelet) : k8s Cluster의 모든 Node에서 실행되며 Pod의 spec을 전달받아 Container들이 실행되는것을 관리 및 실행여부를 체크하는 역할을한다. (api서버의 명령을 listen하여 pod의 상태검사, 생성, 삭제 작업을 한다.) Master의 API서버와 통신하며 Node가 수행해야할 명령을 받거나 노드의 상태를 Master한테 전달해준다.

- [kube-proxy](https://kubernetes.io/ko/docs/concepts/overview/components/#kube-proxy) : kubernetes Cluster안에서 가상 네트워크를 동작할 수있게하는 역할을 한다.
  Node로 들어오는 네트워크 트래픽을 적합한 container로 라우팅하며 Node의 네트워크 트래픽을 로드밸런싱해준다. 클러스터내의 Pod와 서비스의 연결을 통해 pod끼리의 통신을 가능하게 한다.

## Kubernetes Object

[쿠버네티스 Object](https://kubernetes.io/ko/docs/concepts/overview/working-with-objects/kubernetes-objects/)는 쿠버네티스 시스템에서 영속성을 가지는 오브젝트이다. 즉 오브젝트가 생성되면 쿠버네티스는 이 상태를 영구히 유지하기 위해 작동한다. <br />
쿠버네티스의 오브젝트는 spec과 status등의 값을 가지는데, 여기에는 오브젝트를 생성한 의도나 오브젝트를 관리할 때 원하는 상태 등을 설정한다.

쿠버네티스에는 다음과 같은 기본 Object들이 있는데, 이에 대해 알아본다.

- [Pod](https://kubernetes.io/ko/docs/concepts/workloads/pods/)
- [Namespace](https://kubernetes.io/ko/docs/concepts/overview/working-with-objects/namespaces/)
- [Volume](https://kubernetes.io/ko/docs/concepts/storage/volumes/)
- [Service](https://kubernetes.io/ko/docs/concepts/services-networking/service/)
- [Ingress](https://kubernetes.io/ko/docs/concepts/services-networking/ingress/)
- [Deployment](https://kubernetes.io/ko/docs/concepts/workloads/controllers/deployment/)

## Pod

Pod는 쿠버네티스 에서 이용되는 Container의 관리단위로 생성/관리/배포가능한 가장작은 단위의 유닛이며 Cluster내에서 실제 Application이 구동되는 Object다. <br />
Pod는 하나 이상의 Container로 구성되며, 동일한 Pod 내에서는 storage/network를 공유 할 수 있다. <br />

몇 가지 Pod 설정에 대해 알아본다.

#### Pod에 리소스 제한 (cpu, memory) 설정을 해야 하는 이유

Pod 하나가 너무 많은 리소스를 사용하게 되면 노드안의 다른 Pod들도 먹통이 될 수 있다. <br />
리소스 제한을 설정하면 아래 그림 처럼 Pod가 리소스제한까지 사용했을 때 쿠버네티스에서 해당 Pod만 재시작해준다.

<img src="/static/images/pod-restart.png" width="400" />

cpu, memory 리소스 제한 설정은 아래의 `resources` 부분을 참고한다.

```
  spec:
      containers:
        - name: hubot-hey-cookie
          image: hubot-hey-cookie
          imagePullPolicy: IfNotPresent
          env:
            - name: HUBOT_SLACK_TOKEN
              valueFrom:
                secretKeyRef:
                  name: hubot-slack-token
                  key: HUBOT_SLACK_TOKEN
          resources:
            limits:
              cpu: 2
              memory: 2Gi
            requests:
              cpu: 1
              memory: 1Gi
      restartPolicy: Always
```

#### 특정 Worker 노드에만 Pod 배포하기

특정 Pod가 Heavy한 작업을 하여 같은 노드내의 다른 Pod에도 영향을 줄 수 있다면 배포되는 Worker노드를 따로 분리하는게 좋다. <br />

[nodeAffinity](https://kubernetes.io/ko/docs/tasks/configure-pod-container/assign-pods-nodes-using-node-affinity/)를 통해 특정 Worker 노드에만 Pod를 배포할 수 있다.
아래에서 Pod를 key는 disktype이고 value는 ssd인 노드에만 배포해달라고 설정할 수 있다. <br />
이를 통해 Heavy한 Batch작업 Pod와 서비스를 해야하는 Pod를 나누어서 다른 노드에 배포할 수 있다.

```
apiVersion: v1
kind: Pod
metadata:
  name: nginx
spec:
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
        - matchExpressions:
          - key: disktype
            operator: In
            values:
            - ssd
  containers:
  - name: nginx
    image: nginx
    imagePullPolicy: IfNotPresent
```

#### 여러 노드에 분산해서 Pod 배포하기

[podAntiAffinity](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#affinity-and-anti-affinity)를 통해 같은 노드가 아닌 여러 노드에 분산해서 Pod를 배포할 수 있다.

아래에서 podAntiAffinity 설정을 통해 **"key는 app이고 value는 store인 Pod를 피해서 배치해줘"** 라고 요청할 수 있다. 그러면 label이 `app: store` 인 Pod들은 같은 노드에 배치되지 않고 모두 다른 노드에 분산되어 배치된다.

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-cache
spec:
  selector:
    matchLabels:
      app: store
  replicas: 3
  template:
    metadata:
      labels:
        app: store
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - store
            topologyKey: "kubernetes.io/hostname"
      containers:
      - name: redis-server
        image: redis:3.2-alpine
```

다음 그림과 같이 배치된다.

<img src="/static/images/podAntiAffinity.png" width="600" />

#### Liveness, Readiness Prove

참고 : https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/

`Liveness Prove`는 Pod는 살아있는데 App서비스가 비정상인 경우 Liveness Prove를 통해 Health Check를 하여 응답이 없으면 자동으로 재시작해준다.

`Readiness Prove`는 Pod가 배포중이거나 하여 준비상태가 아닌 경우 Service에서 해당 Pod로는 트래픽을 보내지 않게 설정하는 방법 (Liveness Prove 처럼 설정한 path, port로 Health Check를 하여 체크한다.)

[Readiness Prove 설정시]
<img src="/static/images/readiness-probe.png" width="400" />

## Namespace

쿠버네티스에서는 pod, deployment, statefulset, secret 등의 오브젝트들을 클러스터내에서 논리적으로 분리할 수 있는 [namespace](https://kubernetes.io/ko/docs/concepts/overview/working-with-objects/namespaces/)를 제공하고 있다. 오브젝트들을 묶은 하나의 가상 공간 또는 그룹이라고 이해할 수 있다. <br />

<img src="/static/images/namespace-k8s.png" width="600" />

위 그림에서 dev/stg/prd 세 개의 namespace로 구분하였다. <br />
dev 목적의 사용자는 dev namespace에 접근하여 오브젝트를 배치 또는 운영하고, stage 목적의 사용자는 stg namespace에 접근하여 운영한다. <br />
중요한 것은 **namespace는 클러스터를 논리적으로 분리하는 것이지, 물리적으로 분리하는 것은 아니다!** 라는 것이다. <br />
(클러스터의 장애가 발생할 경우, 모든 namespace가 타격을 입게 된다. isolation을 원할 경우, 쿠버네티스 클러스터를 다중화/이중화 함으로써 해결해야 한다.)

<img src="/static/images/k8s-namespace.png" width="600" />

위 그림에서 보듯이 namespace별로 리소스 할당량을 지정할 수 있다. 또한 사용자별로 namespace 접근 권한을 관리할 수 있다.

### Volume

[Volume](https://kubernetes.io/ko/docs/concepts/storage/volumes/)은 Pod가 사라지더라고 저장/보존이 가능하며 Pod에서 사용할 수 있는 디렉터리를 제공한다. <br />

쿠버네티스에서 Pod는 고정된 개념이 아니며 끊임없이 사라지고 생성된다. 그렇기 때문에 Pod는 디렉터리도 임시로 사용한다. Pod가 사라지더라도 사용할 수 있는 디렉터리는 볼륨 오브젝트를 통해 생성하여 사용할 수 있다.

### Service

[Service](https://kubernetes.io/ko/docs/concepts/services-networking/service/)는 Pod 앞단에서 네트워크 말단이 되는 리소스이다. <br />
Label Selector를 통해서 Pod를 타겟팅하고 로드밸런싱 역할을 한다.

<img src="/static/images/k8s-service.png" width="600" />

Service에는 다음과 같은 타입이 있다.

- Cluster IP : 쿠버네티스의 디폴트 설정으로 외부에서 접근가능한 IP를 할당받지 않기 때문에 Cluster내에서만 해당 서비스를 노출할 때 사용되는 Type
- NodePort : 해당 서비스를 외부로 노출시키고자 할 때 사용되는 Service Type으로 외부에 Node IP와 Port를 노출시킴
- LoadBalancer : 클라우드상에 존재하는 LoadBalancer에 연결하고자 할 때 사용되는 Service Type으로 LoadBalancer의 외부 External IP를 통해 접근이 가능하다.

그리고 Service yaml 파일에 기술된 name으로 쿠버네티스 클러스터상에 DNS를 생성할 수 있다. <br />
쿠버네티스는 자체 DNS서버를 가지고 있어 클러스터 내부에서만 사용가능한 DNS를 설정해서 사용할 수 있다. <br />
이것은 쿠버네티스상에서 통신할때 IP기반이 아닌 DNS를 통해 연결할 수 있음을 뜻하며 위의 그림과 같이 Pod에서 다른 Pod의 서비스를 연결할때 사용된다.

### Ingress

[Ingress](https://kubernetes.io/ko/docs/concepts/services-networking/ingress/)는 외부에서 들어온 HTTP와 HTTPS 트래픽을 ingress resouce를 생성하여 Cluster내부의 Service로 L7영역에서 라우팅하며 로드밸런싱, TLS, 도메인 기반의 Virtual Hosting을 제공한다. <br />

<img src="/static/images/service-ingress.png" width="600" />

아래와 같이 Ingress를 통해 Path기반으로 라우팅을 설정할 수 있다.

<img src="/static/images/ingress-path-route.png" width="600" />

다음의 Service & Ingress를 설정한 yaml 파일을 참고한다.

```
apiVersion: v1
kind: Secret
metadata:
  name: fintech-prod
type: Opaque
---
apiVersion: v1
kind: Service
metadata:
  labels:
    app.kubernetes.io/name: fintech-prod
    app.kubernetes.io/part-of: fintech-prod
  name: fintech-prod
spec:
  ports:
    - name: fintech-prod
      port: 3000
      protocol: TCP
      targetPort: 3000
  selector:
    app.kubernetes.io/name: fintech-prod
    app.kubernetes.io/part-of: fintech-prod
  type: ClusterIP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app.kubernetes.io/name: fintech-prod
    app.kubernetes.io/part-of: fintech-prod
  name: fintech-prod
spec:
  replicas: 3
  revisionHistoryLimit: 2
  selector:
    matchLabels:
      app.kubernetes.io/name: fintech-prod
  strategy:
    rollingUpdate:
      maxUnavailable: 15%
    type: RollingUpdate
  template:
    metadata:
      labels:
        app.kubernetes.io/name: fintech-prod
        app.kubernetes.io/part-of: fintech-prod
    spec:
      automountServiceAccountToken: false
      containers:
        - command:
            - sh
            - -c
            - yarn start
          envFrom:
            - configMapRef:
                name: fintech-prod
            - secretRef:
                name: fintech-prod
          image: harbor.xxx.com/fintech/web/default
          imagePullPolicy: Always
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 100
          name: default
          ports:
            - containerPort: 3000
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 100
          resources:
            limits:
              cpu: '1'
              memory: 2Gi
            requests:
              cpu: 100m
              memory: 128Mi
          volumeMounts:
            - mountPath: /var/secret
              name: secret
              readOnly: true
      volumes:
        - name: secret
          secret:
            secretName: fintech-prod
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  labels:
    app.kubernetes.io/name: fintech-prod
    app.kubernetes.io/part-of: fintech-prod
  name: fintech-prod
  annotations:
    ingress.kubernetes.io/force-ssl-redirect: 'true'
spec:
  ingressClassName: contour-private
  rules:
    - host: mydomain.xxx.com
      http:
        paths:
          - backend:
              service:
                name: fintech-prod
                port:
                  number: 3000
            path: /
            pathType: Prefix
  tls:
    - hosts:
        - mydomain.xxx.com
      secretName: tls-xxx.com
```

---

### 참고

- [공식문서](https://kubernetes.io/ko/docs/concepts/)

- [[NHN FORWARD 22] K8s 도입하면서 겪은 일들](https://www.youtube.com/watch?v=JBGsqsoGxEo&list=LL&index=1)

- [쿠버네티스(Kubernetes)란?](https://seongjin.me/kubernetes-core-concepts/)

- [쿠버네티스 POD 란?](https://blog.wonizz.tk/2019/08/19/kubernetes-pod/)
