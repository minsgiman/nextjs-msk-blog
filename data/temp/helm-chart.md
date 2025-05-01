---
title: Helm Chart
date: '2025-5-1'
tags: ['Helm Chart', 'k8s']
draft: false
summary: ''
---

## Helm ?

* Helm은 Kubernetes의 패키지 매니저로, 차트(Chart)라는 패키지를 사용하여 애플리케이션을 배포하고 관리합니다.
* 차트는 Kubernetes 리소스의 템플릿을 포함하고 있으며, 이를 통해 **애플리케이션의 설치 및 구성을 자동화**할 수 있습니다.
* Helm은 다음과 같은 주요 기능을 제공합니다.
  * 패키징: 애플리케이션을 차트로 패키징하여 쉽게 배포할 수 있습니다.
  * 버전 관리: 애플리케이션의 버전을 관리하고, 이전 버전으로 롤백할 수 있습니다.
  * 공유: 차트를 공유하여 다른 사용자나 팀이 쉽게 애플리케이션을 배포할 수 있도록 합니다.
  * 구성 관리: 다양한 환경에 맞게 애플리케이션의 구성을 관리할 수 있습니다.
* https://helm.sh/ko/docs/intro/install/ 을 참고하여 Helm을 설치합니다.

## Helm chart 

* Helm chart는 Kubernetes 애플리케이션을 정의하고 설치하는 데 사용되는 패키지입니다.
* Kubernetes 리소스를 생성하는 데 필요한 파일과 디렉토리로 구성되고, 기본적인 Helm Chart의 구조는 다음과 같습니다.

  ```
  mychart/
    ├── Chart.yaml
    ├── charts/
    ├── templates/
    ├── values.yaml
    └── README.md
  ```

* Chart.yaml: 차트의 메타데이터를 포함하는 파일입니다. 차트의 이름, 버전, 설명, 작성자 정보 등이 포함됩니다. 

  ```yaml
  apiVersion: v2
  name: mychart
  description: A Helm chart for Kubernetes
  version: 0.1.0
  appVersion: "1.0"
  ```

* charts/ : 의존성 차트를 저장하는 디렉토리입니다. 차트가 다른 차트에 의존하는 경우, 이 디렉토리에 해당 차트를 포함시킬 수 있습니다.
  * templates/: Kubernetes 매니페스트 파일의 템플릿을 저장하는 디렉토리입니다. 이 디렉토리 내의 파일들은 Go 템플릿 언어를 사용하여 작성되며, values.yaml파일의 값을 참조하여 동적으로 구성됩니다.
    * 예를들어 아래와 같이 deployment, service, hpa, pdb 설정을 넣을 수 있습니다. 
  
    ```
      mychart/
      ├── Chart.yaml
      ├── values.yaml
      ├── charts/
      ├── templates/
      │   ├── deployment.yaml
      │   ├── hpa.yaml
      │   ├── service.yaml
      │   └── pdb.yaml
      └── README.md
    ```

* values.yaml : 차트의 기본 설정 값을 정의하는 파일입니다. 사용자는 이 파일을 수정하여 템플릿에 전달할 변수를 설정할 수 있습니다. 이는 환경별로 다른 설정을 적용할 때 유용합니다.
  * 예) values-beta.yaml 

  ```yaml
  replicaCount: 3
   
  image:
    repository: sample
    tag: "1.21.1"
   
  service:
    type: ClusterIP
    port: 80
  ```

* README.md: 차트에 대한 설명과 사용법을 문서화하는 파일입니다.

## [Helm command](https://helm.sh/ko/docs/helm/helm/)

* helm search: 차트를 검색합니다.
  * helm search hub \<chart명\>: 여러 헬름 차트의 저장소인 헬름 허브에서 차트를 찾습니다.
  * helm search repo \<chart명\>: 기존에 추가된 저장소에서 차트를 찾습니다.
* helm install \<release 명\> \<chart명\>: 차트를 설치합니다. 가장 간단하게는 사용자가 지정한 릴리스 이름, 설치하려는 차트 이름의 2개 인수를 받습니다.
* helm uninstall \<chart명\>: 설치를 삭제하고자할때 실행합니다.
* helm status \<chart명\>: 릴리스의 상태 추적을 계속하거나, 구성 정보를 재확인할 수 있습니다.
* helm upgrade: 새로운 버전의 차트가 릴리스되었을 때, 또는 릴리스의 구성을 변경하고자 할 때 사용합니다.
* helm rollback: 이전 릴리스로 롤백합니다.
* helm repo: repo 명령어 그룹은 차트 저장소를 추가, 목록조회, 제거하는 명령어를 제공합니다.
  * helm repo list
  * helm repo add
  * helm repo update
  * helm repo remove
* helm list: 설치된 릴리스 목록을 표시합니다.
* helm delete: 설치된 릴리스를 삭제합니다.
* helm lint: 형식이 맞는지 검증합니다.
* helm package: 배포용 차트로 패키징합니다.
* helm get values \<release-name\>: 해당 릴리스에 대한 --set 설정값들을 조회합니다.

## Helm Usage Guidelines

1. Chart 구조 이해 : Helm Chart의 기본 구조를 이해하고, Chart.yaml, values.yaml, templates 디렉토리 등을 잘 활용하세요
2. 버전 관리 : Chart의 버전을 명확하게 관리하고, 변경 사항이 있을 때마다 버전을 업데이트하세요. 이는 배포 시 혼란을 줄일 수 있고 롤백을 가능하게 합니다.
3. Values 파일 사용 : 환경별로 다른 설정이 필요할 때는 values 파일을 활용하세요. 예를 들어, values-real.yaml, values-beta.yaml 등을 만들어 환경에 맞게 설정하세요.
4. template 사용 : 복잡한 설정을 단순화하기 위해 템플릿 기능을 적극 활용하세요. 템플릿을 사용하면 재사용성과 유지보수성이 높아집니다.
5. Linting : helm lint 명령어를 사용하여 Chart의 문법 오류를 사전에 검출하세요. 이는 배포 실패를 줄이는 데 도움이 됩니다.
6. CI/CD 통합 : Helm을 CI/CD 파이프라인에 통합하여 자동화된 배포 프로세스를 구축하세요. 이를 통해 배포의 일관성과 신뢰성을 높일 수 있습니다.
7. 보안 사항 확인 : 민감한 정보는 values 파일에 직접 포함하지 말고, Kubernetes Secrets를 활용하세요.
8. Chart 저장소 관리 : Chart 저장소를 잘 관리하고, 필요한 경우 자체 Chart 저장소를 운영하여 내부 Chart를 관리하세요.
9. 문서화 : Chart와 관련된 설정 및 사용법을 문서화하여 팀 내에서 쉽게 이해하고 사용할 수 있도록 합니다.

## [Helm Hooks](https://helm.sh/ko/docs/topics/charts_hooks/)

Helm Chart Hooks는 Helm을 사용하여 애플리케이션을 배포할 때 특정 시점에 사용자 정의 작업을 수행할 수 있도록 하는 기능입니다. <br />
Hooks는 Helm 차트의 라이프사이클 동안 특정 이벤트가 발생할 때 실행되며 이를 통해 배포 전이나 후, 업그레이드 전이나 후, 삭제 전이나 후 등 다양한 시점에 필요한 작업을 자동화할 수 있습니다. <br />
Helm Hooks의 주요 유형은 다음과 같습니다.

* pre-install: 차트가 설치되기 전에 실행됩니다.
* post-install: 차트가 설치된 후에 실행됩니다.
* pre-delete: 차트가 삭제되기 전에 실행됩니다.
* post-delete: 차트가 삭제된 후에 실행됩니다.
* pre-upgrade: 차트가 업그레이드되기 전에 실행됩니다.
* post-upgrade: 차트가 업그레이드된 후에 실행됩니다.
* pre-rollback: 차트가 롤백되기 전에 실행됩니다.
* post-rollback: 차트가 롤백된 후에 실행됩니다.
* test: 차트의 테스트가 실행될 때 사용됩니다.

각 Hook은 Kubernetes 리소스의 주석(annotation)으로 정의할 수 있고, helm.sh/hook 주석을 사용하면 특정 리소스를 특정 Hook 이벤트에 연결할 수 있습니다. <br />
아래 Job 예시는 pre-install를 이용하여 Helm 차트가 설치되기 전에 containers에 적힌 my-image Docker image를 먼저 실행할 수 있습니다.

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: "{{ .Release.Name }}-my-hook"
  annotations:
    "helm.sh/hook": pre-install
spec:
  template:
    spec:
      containers:
      - name: my-hook
        image: my-image
      restartPolicy: Never
```

ArgoCD에서는 helm install, update cli를 사용하지 않아 helm hooks 가 트리거링 되지 않습니다. <br />
하지만 ArgoCD hook을 지원하여 대체하고 있습니다. 자세한 정보은 [공식문서](https://argo-cd.readthedocs.io/en/stable/user-guide/helm/#helm-hooks)를 참고해주세요.

## [Helm Test](https://helm.sh/ko/docs/topics/chart_tests/)

Helm test는 차트에 정의된 테스트를 실행하여 배포된 애플리케이션이 예상대로 작동하는지 확인하는 데 사용됩니다. 이 기능을 통해 사용자는 차트가 Kubernetes 클러스터에 올바르게 배포되었는지 검증할 수 있습니다. <br />
예를 들어 values.yaml 파일의 구성이 제대로 삽입되었는지 확인하는 데에 사용할 수 있습니다. <br />
test는 template 디렉토리에 정의되어있어야하며 test가 성공한 것으로 판정되려면 컨테이너가 성공적으로 종료되어야 합니다(exit 0). 또한 어노테이션(helm.sh/hook : test)가 반드시 포함되어야합니다. <br />
유의할 점으로는 Helm test는 차트가 설치된 후에 수동으로 실행합니다. 릴리즈 후 helm test \<릴리즈명\> 으로 실행할 수 있습니다. 만약 릴리즈 직후 바로 실행하게 되면 모든 pod가 준비되어있지 않아 일시적인 오류가 있을 수 있습니다. <br />
아래 예시에 쓰인 restartPolicy 옵션은 Pod가 한번만 실행되고 종료되도록 합니다.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: "{{ .Release.Name }}-test"
  annotations:
    "helm.sh/hook": test
spec:
  containers:
  - name: curl
    image: curlimages/curl:latest
    command: ['sh', '-c', 'curl -f http://{{ .Release.Name }}-service/health || exit 1']
  restartPolicy: Never
```

## [Helm Lib Chart](https://helm.sh/ko/docs/topics/library_charts/)

Helm 3에서 도입된 기능으로, 공통 템플릿과 구성을 여러 차트에서 재사용할 수 있도록 하는 차트 유형입니다. 차트 개발자가 중복 코드를 줄이고, 유지보수를 쉽게 하며, 일관된 배포 구성을 보장하는 데 도움을 줍니다.

Library Chart의 특징은 다음과 같습니다.

* 공통 템플릿 재사용: 공통 템플릿을 정의하고 이를 다른 차트에서 가져와 사용할 수 있습니다. 이는 여러 차트에서 반복적으로 사용되는 템플릿 코드를 한 곳에 모아 관리할 수 있게 해줍니다.
* 템플릿 함수 제공: 템플릿 함수나 정의를 제공하여 다른 차트에서 이를 호출할 수 있습니다. 이를 통해 복잡한 로직을 캡슐화하고 재사용할 수 있습니다.
* 독립적 배포 불가: Library Chart는 자체적으로 배포될 수 없습니다. 이는 단순히 템플릿과 구성을 제공하는 역할만 하며, 실제 애플리케이션 리소스를 정의하지 않습니다.
* 의존성 관리: 다른 차트에서 Library Chart를 의존성으로 추가하여 사용할 수 있습니다. 이는 Chart.yaml 파일의 dependencies 섹션에 Library Chart를 명시하여 관리합니다.

Helm Library를 생성하기 위해서는 chart.yaml 파일에 Library 타입임을 명시해줘야합니다

```yaml
apiVersion: v2
name: my-library-chart
version: 0.1.0
type: library
```

템플릿의 위치는 template/ 디렉토리 하위에 있어햐하며 _*.tpl 혹은 _*.yaml 형식의 파일로 선언해야합니다. (파일명은 _로 시작해야합니다.) <br />
아래의 예처럼 template/_sample.tpl 파일을 생성했다고 합시다.

```yaml
{{- define "my-library-chart.labels" -}}
app.kubernetes.io/name: {{ include "my-library-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
```

사용자 측에서는 의존성 추가후 템플릿을 사용합니다.

```yaml
# my-app-chart/Chart.yaml
apiVersion: v2
name: my-app-chart
version: 0.1.0
dependencies:
- name: my-library-chart
version: 0.1.0
repository: "file://../my-library-chart"
```

```yaml
# my-app-chart/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "my-app-chart.fullname" . }}
  labels:
          {{- include "my-library.labels" . | nindent 4 }}
spec:
  replicas: 1
  selector:
    matchLabels:
            {{- include "my-library.labels" . | nindent 6 }}
  template:
    metadata:
      labels:
              {{- include "my-library.labels" . | nindent 8 }}
    spec:
      containers:
        - name: my-app
          image: my-app:latest
```

참고로 argocd 에서는 helm template 이외에는 helm 커맨드를 사용하지 않고 직접 관리한다.

https://argo-cd.readthedocs.io/en/stable/faq/#after-deploying-my-helm-application-with-argo-cd-i-cannot-see-it-with-helm-ls-and-other-helm-commands

