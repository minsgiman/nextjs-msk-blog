---
title: ArgoCD 로 monorepo 프로젝트 배포하기 2 (Application 구성)
date: '2024-06-15'
tags: ['argocd', 'nx', 'pnpm', 'monorepo', 'frontend', 'github-actions', 'ci', 'cd', 'k8s']
draft: false
summary: ''
---

## 1. Docker 빌드 설정

#### Dockerfile 준비

* 대상이 되는 Application에 맞는 Dockerfile을 작성한다.
  * Nextjs: node 
    * [Dockerfile](https://github.com/minsgiman/nx-shops/blob/develop/apps/cart/Dockerfile) 을 참고한다.
    * [nextjs docker sample](https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile)
  * Reactjs: nginx

#### Docker build & push CI 스크립트 작성 

1. monorepo 에서 PR merge시 affected 를 체크하여 matrix (phase * affected app) 로 deploy 를 수행한다.
    * [release-dev.yml](https://github.com/minsgiman/nx-shops/blob/develop/.github/workflows/release-dev.yml)
    * 열려있는 PR list 중 branch를 확인하여 release branch가 있는 경우 affected에서 제외합니다.
    * dockerfile 이 없는 apps가 대상일 경우 build를 실행하지 않고 정상 종료합니다.
    * github action에서 branch, app, phase 를 선택하여 수동으로 deploy 할때는 [release-manual.yml](https://github.com/minsgiman/nx-shops/blob/develop/.github/workflows/release-manual.yml) 를 사용한다.
        <img src="/static/images/manual-workflow.png" />

2. 다음과 같이 Docker build & push 를 수행하는 deploy action 실행
    * [deploy/action.yml](https://github.com/minsgiman/nx-shops/blob/develop/.github/actions/deploy/action.yml)
      * Dockerfile 체크
      * app build
      * Docker image 태그 생성 by phase + commit hash
      * Docker build & push to Docker Hub
        * [build/docker-build-push/action.yml](https://github.com/minsgiman/nx-shops/blob/develop/.github/actions/build/docker-build-push/action.yml)
      * git repo에 docker tag 업데이트 (manifest branch) - 이후 argocd에서 사용
        * [update-manifest/action.yml](https://github.com/minsgiman/nx-shops/blob/develop/.github/actions/update-manifest/action.yml)

실행 완료 후 harbor에 이미지가 업로드가 되었는지 확인 <br />
manifest 설정에 docker tag 정보가 업데이트 되었는지 확인

## 2. Manifest 구성

* github 저장소에 Application에 대한 k8s 설정을 입력합니다.
* 대표적으로 적용해야하는 설정은 다음과 같습니다 (`{}` 내용을 동적으로 채워 넣습니다)
* image tag는 위의 CI script docker tag 과정에서 자동으로 업데이트된다.

```yaml
# values.{phase}.yaml
application:
  name: {app name}
image:
  name: harbor.com/web/{project name}/{phase}
  tag: 43ecce48ee49c5b3c0ca7ce59e4e0c713f2eeb1b # bot이 자동 업데이트 예정
  imagePullPolicy: Always
  harborUser: harbor-user
ingress:
  hosts:
    - host: {host}
      port: 80
      path: {path}
      pathType: Prefix
  tlsSecretName: tls-secret
deployment:
  containerPort: {port}
  livenessProbePath: {l7check url}
hpa:
  minReplicas: {minimum pod number}
  maxReplicas: {maximum pod number}
  cpuAverage: {cpu %}
  memoryAverage: {memory %}
```

helm 차트 설정에 대해서 다음을 참고한다.

* [공식문서](https://helm.sh/docs/topics/charts/#the-chart-file-structure)
* [샘플](https://github.com/minsgiman/nx-shops/tree/develop/manifest/application) 
* [helm 강의](https://malwareanalysis.tistory.com/193)

## 3. ArgoCD Application 설정

<img src="/static/images/argocd-application.png" />

* Sync 누르기
  * namespace 생성 용. (secret 설정에 필요)
  * [sync 설정 강의](https://malwareanalysis.tistory.com/408)

## 그 외

필요한 설정 내용들 

* ArgoCD slack notification 설정
* DNS 연결
  * ingress에 설정한 host를 ingress nginx로 연결한다.
    * 연결할 ip는 ingress nginx application에서 확인할 수 있다.
* [Gitops 강의](https://www.youtube.com/watch?v=kXUmcMoCo5o)
* App of apps 
  * [Argo CD를 통한 지속적인 전달 모범 사례 및 구현](https://blog.cybozu.io/entry/2019/11/21/100000)
  * [공식문서 App Of Apps Pattern](https://argo-cd.readthedocs.io/en/stable/operator-manual/cluster-bootstrapping/#app-of-apps-pattern)
  * [Argo CD App of apps 패턴 한글 문서](https://www.gomgomshrimp.com/posts/argocd/app-of-apps)
  * [App of apps 패턴 강의](https://www.youtube.com/watch?v=1_lUTXwJExw)

* Argo cd 공식 예제
  * https://github.com/argoproj/argocd-example-apps
  * https://github.com/argoproj/argocd-example-apps/tree/master/apps

