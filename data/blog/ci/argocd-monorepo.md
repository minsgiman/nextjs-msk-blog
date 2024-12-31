---
title: ArgoCD App of Apps 패턴
date: '2024-08-18'
tags: ['argocd', 'monorepo', 'frontend', 'github-actions', 'ci', 'cd', 'k8s']
draft: false
summary: 'App of apps, 말 그대로 앱들의 앱이라는 의미로 여러개의 application을 하나의 application으로 관리하는 패턴을 말합니다.'
---

Argo CD의 `App of apps` 패턴에 대해 알아보고, 이를 통한 배포 방법에 대해 알아본다.

먼저 지금까지 사용하는 Argo CD 의 몇가지 문제점에 대해 알아보고, App of apps 패턴을 왜 사용해야 하는지 이해해본다. 

## 지금까지 사용하는 Argo CD 의 몇가지 문제점

#### Argo CD 대시보드(Web UI)에서의 Application의 생성/삭제는 Git으로 관리되지 않는다.

GitOps는 Argo CD를 움직이게 하는 핵심 개념으로, Argo CD가 관리하는 쿠버네티스의 배포에 관한 모든 사항이 Git에 기록된다는 것이 핵심이다. <br />
그런데 Web UI에서 Application을 생성하고 삭제하게되면, 이에 관련된 기록은 어디에도 남지 않게 된다. <br /> 
열심히 GitOps 기반의 배포를 했으나 정작 Application의 배포는 GitOps로 관리할 수 없다는 의미이다.

이로 인해 발생될 수 있는 문제 몇가지는 다음을 들 수 있다.
* Application의 생성/삭제 등의 기록이 없음
* 누가, 어떤 클러스터에 무슨 Application을 생성했는지 알 수 없음
* Application이 삭제되면, Application 생성시 사용한 설정(Sync Policy, Source, Destination 등)도 함께 삭제됨

Argo CD를 본격적으로 사용하면서 쿠버네티스 클러스터만 7개를 관리하고 클러스터마다 약 20+개의 application이 배포된다고 가정하자. 당연히 배포에 관련된 개발자도 점점 늘어난다. <br />

그러면 아래와 같이 하나의 Argo CD Application 안에 많은 쿠버네티스 리소스가 있는 것을 볼 수 있고, 상단을 보면 Git commit message로 저자는 알 수 있지만 누가 이 Application을 만들고, Application의 설정을 바꿨을지는 도저히 알 방법이 없다.

<img src="/static/images/argocd-dashboard.webp" />

이처럼 [1] 배포(App)가 많아지고, [2] 배포자가 여러명이 되고, [3] 많은 리소스가 하나의 App에 관리되기 시작하면서 복잡성이 증가했고, 이를 개선하기 위한 방법이 필요하였다.

## Application (CRD)

위에서 계속 App이라는 용어를 사용했는데, 이는 Argo CD를 설치할 때 생성되는 **Application 이라는 CRD(Custom Resource Definition)** 이다. <br />
Application은 **Argo CD가 관리하는 배포의 가장 작은 단위**이며, Web UI에서 생성했던 App과 같은 리소스에 해당한다. <br />

대시보드에서 mysql-test 라는 App을 생성하면 아래와 같이 Web UI에서 생성한 mysql-test application 리소스를 확인할 수 있다.

```bash
$ kubectl get applications -n argocd mysql-test -o yaml
```

```yaml 
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  finalizers:
  - resources-finalizer.argocd.argoproj.io
  name: mysql-test
  namespace: argocd
spec:
  destination:
    namespace: default
    server: https://kubernetes.default.svc
  project: default
  source:
    helm:
      valueFiles:
      - values.yaml
    path: mysql
    repoURL: https://github.com/minsgiman/helm-charts
    targetRevision: main
  syncPolicy:
    automated: {}
status: {...}
```

여기서 눈여겨볼 값들은 destination, source이며, 알고보면 mysql-test application을 콘솔에서 생성할 때 작성했던 값과 동일한 것을 알 수 있다.

* destination: 배포할 타겟 클러스터를 설정
  * server: 배포할 쿠버네티스 클러스터 api-server 주소
    * 지금은 Argo CD가 배포된 클러스터에 배포하므로 https://kubernetes.default.svc 를 사용한다.
  * namespace: 배포 타겟 네임스페이스
* source: 배포할 소스 repository를 설정
  * repoURL: 소스 repository 주소
  * path: repository 내 path
  * targetRevision: 브랜치 이름
* syncPolicy: 배포 Sync 옵션 설정

결론적으로, Argo CD로 배포한다는 것의 의미는 **application이라는 argoproj.io의 커스텀 리소스를 쿠버네티스에 생성**하고, Argo CD는 application 리소스를 통해 배포를 관리하는 것으로 볼 수 있다. <br />
또한 당연하게도 이를 yaml로 표현할 수 있다. 그 의미는 곧 Argo CD의 배포 최소 단위인 application 역시 GitOps로 관리할 수 있다는 뜻이 된다.

## App of apps 패턴

App of apps 는 말 그대로 앱들의 앱이라는 의미로 여러개의 application을 하나의 application으로 관리하는 패턴을 말한다.

<img src="/static/images/app-of-apps.webp" />

하나의 application안에 다시 여러개의 하위 application 들로 구성하는 것이 전부이다. <br />
각각의 하위 application들은 각자 자신이 필요로하는 Source, Destination, Sync Option 등이 설정되어 있다.

그렇다면 위처럼 App of apps 패턴으로 구성하고 Argo CD에 배포하면 어떻게 될지 생각해보자. <br />
Argo CD는 하위 application들을 포함하는 상위 application 리소스를 생성하게되고, 상위 application으로부터 생성된 하위 application들은 개별적으로 Source, Destination, Sync Option을 갖고 Argo CD에 생성된다. <br />
**즉, App of apps 패턴을 사용하면 하나의 application을 통해 여러개의 application을 생성할 수 있다.** 쉽게 표현하자면 "배포를 배포한다" 고 할 수 있겠다.

## App of apps 패턴 사용해보기

App of apps 패턴형태로 미리 준비해둔 예시 저장소를 먼저 살펴본다.

* App of apps repo: https://github.com/minsgiman/argocd-app-of-apps
* Chart repo: https://github.com/minsgiman/helm-charts

상위 application은 helm chart 형태로 구성을 했으며, 이 차트의 내부에는 apache, mysql, wordpress를 배포할 수 있는 application(CRD)들을 모두 담고 있다.

App of apps repo 상위 application을 배포하면 배포결과로 `app-of-apps` 라는 application과 `apache, mysql, wordpress` application들이 생성되어 총 4개의 application이 생성된 것을 확인할 수 있다.

<img src="/static/images/argocd-app-of-apps1.webp" />

또한, 상위 application인 app-of-apps application을 눌러서 살펴보면, 기존에는 쿠버네티스 리소스가 있던 부분에 똑같이 application 리소스로 3개가 연결되어 있는 것을 확인할 수 있다.

<img src="/static/images/argocd-app-of-apps2.webp" />

마찬가지로 kubectl 커맨드로 application들의 상태를 확인할 수 있다.

```bash
$ kubectl get applications -n argocd

NAME          SYNC STATUS   HEALTH STATUS
apache        Synced        Healthy
app-of-apps   Synced        Healthy
mysql         Synced        Healthy
wordpress     Synced        Healthy
```

### app of apps 사용 사례  

#### App of apps repo yaml 파일

* argocd-applications/beta-values.yaml

```yaml
project: app
phase: beta
destinationServer: https://xxx
annotations:
  notifications.argoproj.io/subscribe.on-created.ly: notice-server_beta
  notifications.argoproj.io/subscribe.on-deleted.ly: notice-server_beta
  notifications.argoproj.io/subscribe.on-deployed.ly: notice-server_beta
  notifications.argoproj.io/subscribe.on-health-degraded.ly: notice-server_beta
  notifications.argoproj.io/subscribe.on-sync-failed.ly: notice-server_beta
  notifications.argoproj.io/subscribe.on-sync-running.ly: notice-server_beta
  notifications.argoproj.io/subscribe.on-sync-status-unknown.ly: notice-server_beta
  notifications.argoproj.io/subscribe.on-sync-succeeded.ly: notice-server_beta

ingressNginx:
  enabled: true
  sourceTargetRevision: 4.9.0
  replicas: 2
  defaultSslCertificate: xxx
  nodepools:
    - dev
app1:
  enabled: true
  sourceTargetRevision: manifest
  argoAutoSync: true
  valueFiles:
    - values.yaml
    - projects/app1/values.beta.yaml
  annotations:
    notifications.argoproj.io/subscribe.on-created.ly: notice-server_beta;notice-app1-argocd-dev
    notifications.argoproj.io/subscribe.on-deleted.ly: notice-server_beta;notice-app1-argocd-dev
    notifications.argoproj.io/subscribe.on-deployed.ly: notice-server_beta
    notifications.argoproj.io/subscribe.on-health-degraded.ly: notice-server_beta;notice-app1-argocd-dev

#...
```

* argocd-applications/templates/app1.yaml

```yaml
{{- if and (.Values.app1) (.Values.app1.enabled) -}}
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: app1-{{ .Values.phase }}
  annotations:
  {{- toYaml .Values.app1.annotations | nindent 4 }}
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: {{ .Values.project }}
  source:
    repoURL: 'git@xxx:yyy/app1.git'
    path: 'manifest/application'
    targetRevision: {{ .Values.app1.sourceTargetRevision }}
    helm:
      releaseName: app1-{{ .Values.phase }}
      valueFiles:
      {{- toYaml .Values.app1.valueFiles | nindent 8 }}
  destination:
    server: {{ .Values.destinationServer }}
    namespace: app1-{{ .Values.phase }}
  syncPolicy:
    {{- if .Values.app1.argoAutoSync }}
    automated:
      prune: true
    {{- end }}
    syncOptions:
      - CreateNamespace=true
{{- end }}
```

#### app1 repo yaml 파일

* manifest/application/projects/app1/values.beta.yaml

```yaml
application:
  name: app1
image:
  name: xxx
  tag: "beta.ed348d"
  imagePullPolicy: Always
ingress:
  hosts:
    - host: xxx.com
      port: 80
      path: /
      pathType: Prefix
deployment:
  containerPort: 4200
  livenessProbePath: /api/l7check
  nodeSelector:
    xxx.com/nodepool: appbeta
  resource:
    requests:
      cpu: 1150m
      memory: 2300Mi
    limits:
      cpu: 1150m
      memory: 2300Mi
hpa:
  minReplicas: 2
  maxReplicas: 4
  cpuAverage: 70
  memoryAverage: 80
pdb:
  maxUnavailable: 1
vos:
  enable: true
  phase: beta
```

## 언제, 왜 써야할까?

Argo CD Docs에서는 App of apps 패턴을 사용하는 사례로 [Cluster Bootstraping](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/)을 설명하고 있다.

예시대로 새로 구축한 쿠버네티스 클러스터에 많은 App을 설치하려는 관리자의 관점에서 App of apps 패턴은 매우 유용할 것이다.

이는 앞서 언급한 문제점 중 [1] App이 많아지고, [3] 많은 리소스가 하나의 App에 관리되는 포인트를 해결할 수 있다. <br />
하지만 Application 역시 GitOps 로 관리할 수 있다는 점이 핵심일 것 같다.

결과적으로, 많은 App을 배포할 때, 그리고 application까지 GitOps로 관리할 수 있다는 측면에서 App of apps 패턴은 다음과 같이 매우 유용할 것이다.

* 많은 App을 하나의 application으로 관리하고 한 번에 배포 가능
* 각 application의 변경은 chart repo에서 GitOps로 관리
* application의 추가/생성/변경은 app of apps repo에서 GitOps로 관리


## 참고

--- 

* [Argo CD를 통한 지속적인 전달 모범 사례 및 구현](https://blog.cybozu.io/entry/2019/11/21/100000)
* [공식문서 App Of Apps Pattern](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/#app-of-apps-pattern)
* [Argo CD App of apps 패턴 한글 문서](https://www.gomgomshrimp.com/posts/argocd/app-of-apps)
* [App of apps 패턴 강의](https://www.youtube.com/watch?v=1_lUTXwJExw)

