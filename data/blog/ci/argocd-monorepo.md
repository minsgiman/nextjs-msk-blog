---
title: ArgoCD 로 monorepo 프로젝트 배포하기 1 (Cluster 구성)
date: '2024-05-15'
tags: ['argocd', 'nx', 'pnpm', 'monorepo', 'frontend', 'github-actions', 'ci', 'cd', 'k8s']
draft: false
summary: ''
---

다음 그림과 같이 [ArgoCD](https://argo-cd.readthedocs.io/en/stable/)를 통해 gitops 방식으로 k8s 클러스터에 애플리케이션을 배포하는 방법에 대해 알아본다. <br />

<img src="/static/images/argocd-gitops-flow.png" />

다음 구조와 같이 구축하는 것을 목표로 한다.

<img src="/static/images/argocd-k8s-structure.png" />


### 1. Kubernetes cluster 생성

ArgoCD 를 사용하기 위해서는 먼저 k8s 클러스터([Cluster Architecture](https://kubernetes.io/docs/concepts/architecture/) 참고)를 생성해야 한다.

* 관리형 Kubernetes : AWS EKS, Google GKE, Azure AKS와 같은 클라우드 제공업체에서 제공하는 서비스를 통해 k8s 클러스터 생성
* On-premise 환경 : [Kubernetes 설치 가이드](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/install-kubeadm/)를 참고하여 kubeadm, kubelet, kubectl 을 설치하고 사용하여 클러스터를 생성할 수도 있다.

생성한 k8s 클러스터는 이후 ArgoCD application과 sync를 통해 배포할 프로젝트를 관리할 수 있다. <br />
(참고 : https://malwareanalysis.tistory.com/406)

생성한 클러스터는 kubectl 을 통해 접근한다.

### 2. ArgoCD 설정

1. cluster 등록
* ArgoCD cli를 사용하여 k8s 클러스터를 등록한다. 
   * 참고: https://dev.to/thenjdevopsguy/registering-a-new-cluster-with-argocd-12mn

2. repository 등록 (아래 문서 참고)
* [Private Repositories 공식문서](https://argo-cd.readthedocs.io/en/stable/user-guide/private-repositories/)
* https://malwareanalysis.tistory.com/415

3. project 생성 및 설정 (아래 문서 참고)
* [Project 공식문서](https://argo-cd.readthedocs.io/en/stable/user-guide/projects/) 를 참고하여 다음 항목들을 설정한다.
   * source repository
   * destinations (cluster)
   * cluster resource allow list
* https://malwareanalysis.tistory.com/437

### 3. Ingress Nginx Controller 설정

기본적으로 ArgoCD API server는 외부에서 접근할 수 없다. 외부에서 ArgoCD 서버에 접근하여 애플리케이션을 배포하고 관리하려면, 먼저 Ingress Nginx Controller 같은 네트워킹 구성 요소가 설정되어 있어야 한다. <br />
* 참고 
  * https://argo-cd.readthedocs.io/en/stable/getting_started/#3-access-the-argo-cd-api-server
  * https://developnote-blog.tistory.com/171

Ingress Controller 에 대한 설명은 <a href="/blog/ci/ingress-controller">여기</a>에 정리해두었다.

ArgoCD 에서 Ingress Nginx 의 Application 을 배포하기 위해서는 다음과 같은 설정이 필요하다.

1. Application에서 +New App을 통해 새로운 application을 생성합니다.

* General
  * application name
  * project name
  * Auto-create namespace 체크
* Source
  * repository url
  * branch
  * path → ingress-nginx (git repository 내 ingress-nginx 폴더)
* Destination
  * cluster name
  * namespace → unique하게 입력

<img src="/static/images/ingress-nginx-1.png" width="700" />


2. 생성한 application 내부로 들어가 values 설정
   
* details > parameters > values files

<img src="/static/images/argocd-values.png" />

3. Application의 Sync 버튼을 클릭하여 배포

<img src="/static/images/ingress-nginx-2.png" />

### 그 외

* Cluster monitoring을 설정한다. (Grafana, Prometheus)
* Cluster Logger 설정 (OpenSearch) 
* Alert 설정