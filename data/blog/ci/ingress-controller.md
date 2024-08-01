---
title: Ingress Controller
date: '2024-05-05'
tags: ['k8s', 'ingress']
draft: false
summary: '인그레스는 위와 같은 기능들에 대해 정의해둔 규칙들을 정의해둔 리소스이고, 이를 실제 동작하기 위해서는 인그레스 컨트롤러가 필요하다.'
---

인그레스(ingress)는 클러스터 외부에서 내부로 접근하는 요청들을 어떻게 처리할 지 정의해둔 규칙들의 모음이다.

[인그레스](https://kubernetes.io/ko/docs/concepts/services-networking/ingress/)는 아래와 같은 기능들을 제공한다.
* 외부에서 접속가능한 URL 사용
* 트래픽 로드밸런싱
* SSL 인증서 처리
* 도메인 기반 가상 호스팅 제공

인그레스는 위와 같은 기능들에 대해 정의해둔 규칙들을 정의해둔 리소스이고, 이를 실제 동작하기 위해서는 **인그레스 컨트롤러**가 필요하다.

## 인그레스 컨트롤러(Ingress Controller)

**인그레스 컨트롤러(Ingress Controller)는** 클러스터에서 실행되고 수신 리소스에 따라 HTTP 로드 밸런서를 구성하는 응용 프로그램이다.

인그레스가 동작하기 위해서는 인그레스 컨트롤러가 반드시 필요하다.

인그레스 컨트롤러는 자동으로 실행되지 않고 상황에 맞게 적합한 컨트롤러를 선택하여 설치해야 한다. 쿠버네티스에서는 [GCE](https://github.com/kubernetes/ingress-gce)와 [NGINX](https://github.com/kubernetes/ingress-nginx)를 오픈소스로 제공하고 있다.

이외에도 써드파티 솔루션으로 아래와 같은 인그레스 컨트롤러를 [쿠버네티스 문서](https://kubernetes.io/ko/docs/concepts/services-networking/ingress-controllers/)에서 볼 수 있다.

* AKS Application Gateway Ingress Controller
* Ambassador
* BFE Ingress Controller
* Apache APISIX ingress controller
* Istio
* Kong
* Traefik

## 인그레스를 통한 통신 흐름

Ingress와 Ingress Controller에 대한 간단한 아키텍쳐를 살펴보면 아래와 같다.

<img src="/static/images/ingress-controller.png" />

(참고 : https://kubetm.github.io/k8s/08-intermediate-controller/ingress/)

외부에서 사용자가 특정 경로로 접속하게 되면 인그레스를 통해 정의해둔 규칙에 따라 인그레스 컨트롤러가 동작하여 서비스에 맞는 파드로 연결해준다.


## External / Internal Ingress Nginx Controller

External Ingress와 Internal Ingress를 각각 설정하는 이유는 주로 보안, 접근성, 네트워크 구분 등의 이유로 나뉩니다. 이를 통해 외부와 내부 트래픽을 효과적으로 관리할 수 있습니다. 각각의 설정 이유를 자세히 살펴보겠습니다.

### External Ingress

External Ingress는 클러스터 외부에서 접근할 수 있는 트래픽을 처리합니다. 주요 목적과 이유는 다음과 같습니다:

1. **외부 접근 허용**: 외부의 사용자나 서비스가 클러스터 내 애플리케이션에 접근할 수 있게 합니다. 주로 인터넷을 통해 접근하는 웹 애플리케이션에 사용됩니다.
2. **공개 서비스**: 클러스터에서 제공하는 서비스를 외부에 노출하고자 할 때 사용합니다.
3. **도메인 및 SSL 관리**: 도메인 네임 및 SSL/TLS 인증서를 통해 보안 접속을 제공합니다.

### Internal Ingress

Internal Ingress는 클러스터 내부에서만 접근 가능한 트래픽을 처리합니다. 주요 목적과 이유는 다음과 같습니다

1. **내부 서비스 보호**: 내부 네트워크에서만 접근 가능한 애플리케이션이나 서비스를 보호합니다.
2. **보안 강화**: 외부로부터의 직접 접근을 차단하여 보안을 강화합니다.
3. **내부 트래픽 관리**: 내부 마이크로서비스 간의 통신을 효율적으로 관리합니다.

이와 같은 설정을 통해 클러스터 내부와 외부의 트래픽을 효과적으로 분리하고 관리할 수 있다.

### ingress nginx 의 helm 차트 작성

다음 내용을 참고하여 작성한다.

* [Ingress Nginx Controller](https://kubernetes.github.io/ingress-nginx/deploy/#quick-start)
    *  Show ingress nginx values
        * [Guide](https://github.com/kubernetes/ingress-nginx/blob/main/charts/ingress-nginx/README.md)
        * run script
       ```shell
       helm show values ingress-nginx/ingress-nginx > default-values.yaml
       ```
        * https://github.com/kubernetes/ingress-nginx/blob/main/charts/ingress-nginx/values.yaml

* Nginx Config
    * [ConfigMap](https://github.com/kubernetes/ingress-nginx/blob/main/docs/user-guide/nginx-configuration/configmap.md)
        * Global config on nginx controller
        * [Default configs](https://github.com/kubernetes/ingress-nginx/blob/main/internal/ingress/controller/config/config.go)
    * [Annotations](https://github.com/kubernetes/ingress-nginx/blob/main/docs/user-guide/nginx-configuration/annotations.md)
        * Apply configs on each ingress object(not ingress controller)

* Nginx Config Check
  ```shell
  kubectl exec -it {ingress-nginx-controller-pod} -- cat /etc/nginx/nginx.conf > nginx_config.conf
  ```

* script
    * https://github.com/kubernetes/ingress-nginx/blob/main/docs/troubleshooting.md#ingress-controller-logs-and-events

* [Nginx Customization](https://github.com/kubernetes/ingress-nginx/blob/main/docs/user-guide/nginx-configuration/index.md)

### 작성 샘플

```yaml
# External Ingress Controller
ingress-nginx:
  controller:
    autoscaling:
      enabled: true
    annotations:
      reloader.stakater.com/search: "true"
      # `ingress-nginx-controller` prefix is following by argocd projects
      # https://github.com/kubernetes /ingress-nginx/blob/main/charts/ingress-nginx/templates/controller-configmap.yaml
      configmap.reloader.stakater.com/reload: "ingress-nginx-controller-custom-add-headers,ingress-nginx-controller-custom-proxy-headers"
    # -- Will add custom configuration options to Nginx https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/
    config:
      allow-snippet-annotations: true
      log-format-upstream: '$remote_addr($http_x_forwarded_for) - $remote_user [$time_local] "$host" "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent" $request_length $request_time [$proxy_upstream_name] [$proxy_alternative_upstream_name] $upstream_addr $upstream_response_length $upstream_response_time $upstream_status $req_id'
    configAnnotations:
      reloader.stakater.com/match: "true"
    # To prevent downtime when nginx is rolling update
    # https://github.com/kubernetes/ingress-nginx/issues/322#issuecomment-298016539
    lifecycle:
      preStop:
        exec:
          command:
            - "sleep 15"
    # -- Will add custom headers before sending response traffic to the client according to: https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/#add-headers
    addHeaders:
      X-Request-Start: "t=${msec}" # for test.
    metrics:
      enabled: true
    podAnnotations:
      prometheus.io/scrape: "true"
      prometheus.io/port: "10254"
      firth/port.0: 10254
```

```yaml
# internal ingress controller
ingress-nginx:
  controller:
    ingressClassResource:
      name: nginx-internal
      controllerValue: "k8s.io/ingress-nginx-internal"
    autoscaling:
      enabled: true
    annotations:
      reloader.stakater.com/search: "true"
      # `ingress-nginx-controller` prefix is following by argocd projects
      # https://github.com/kubernetes /ingress-nginx/blob/main/charts/ingress-nginx/templates/controller-configmap.yaml
      configmap.reloader.stakater.com/reload: "ingress-nginx-controller-custom-add-headers,ingress-nginx-controller-custom-proxy-headers"
    # -- Will add custom configuration options to Nginx https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/
    config:
      allow-snippet-annotations: true
      log-format-upstream: '$remote_addr($http_x_forwarded_for) - $remote_user [$time_local] "$host" "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent" $request_length $request_time [$proxy_upstream_name] [$proxy_alternative_upstream_name] $upstream_addr $upstream_response_length $upstream_response_time $upstream_status $req_id'
    configAnnotations:
      reloader.stakater.com/match: "true"
    # To prevent downtime when nginx is rolling update
    # https://github.com/kubernetes/ingress-nginx/issues/322#issuecomment-298016539
    lifecycle:
      preStop:
        exec:
          command:
            - "sleep 15"
    # -- Will add custom headers before sending response traffic to the client according to: https://kubernetes.github.io/ingress-nginx/user-guide/nginx-configuration/configmap/#add-headers
    addHeaders:
      X-Request-Start: "t=${msec}" # for test.
      X-Internal-Ingress: "true" # for test.
    metrics:
      enabled: true
    podAnnotations:
      prometheus.io/scrape: "true"
      prometheus.io/port: "10254"
      firth/port.0: 10254
```

```yaml
# Chart.yaml
apiVersion: v2
name: ingress-nginx-subchart
type: application
version: 1.0.0
appVersion: "1.0.0"
dependencies:
  - name: ingress-nginx
    version: 4.8.0
    repository: https://kubernetes.github.io/ingress-nginx
  - name: reloader
    version: 1.0.41
    repository: https://stakater.github.io/stakater-charts
```

```yaml
# values-beta.yaml
ingress-nginx:
  controller:
    resources:
      requests:
        cpu: 500m
        memory: 1000Mi
      limits:
        cpu: 500m
        memory: 1000Mi
    autoscaling:
      enabled: true
      minReplicas: 2
      maxReplicas: 4
      targetCPUUtilizationPercentage: 80
      targetMemoryUtilizationPercentage: 80
    podAnnotations:
      firth/job.0: "web-ingress-nginx-beta"
```

--- 

### 참고 

* [External / Internal Ingress Nginx Controller in AKS](https://medium.com/@hyukjuner/external-internal-ingress-nginx-controller-in-aks-6f31acfac6c9)

* [쿠버네티스 인그레스(Ingress) & 인그레스 컨트롤러(Ingress Controller) + 모니터링](https://velog.io/@dojun527/%EC%BF%A0%EB%B2%84%EB%84%A4%ED%8B%B0%EC%8A%A4-%EC%9D%B8%EA%B7%B8%EB%A0%88%EC%8A%A4Ingress)