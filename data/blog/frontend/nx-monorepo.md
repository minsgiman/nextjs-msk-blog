---
title: monorepo nx 사용
date: '2023-01-27'
tags: ['monorepo', 'nx', 'frontend']
draft: false
summary: 'Nx는 모노레포 구성을 위한 다양한 개발 도구를 제공하고 Angular, React와 같은 프런트엔드 프레임워크 기반의 개발 환경 구성뿐 아니라 Express, Nest.js와 같은 백엔드 기술 기반의 개발까지 폭넓게 지원하고 있다. 이뿐만 아니라 workspace 생성 시 Cypress, Jest 등을 기반으로 한 테스트 환경까지 설정해주기 때문에, 초기 모노레포 개발 환경 구축 비용을 크게 줄여준다.'
---

구글 개발자들이 만든 오픈소스 프로젝트인 [Nx](https://nx.dev/)이다. Nx는 모노레포 구성을 위한 다양한 개발 도구를 제공하고 Angular, React와 같은 프런트엔드 프레임워크 기반의 개발 환경 구성뿐 아니라 Express, Nest.js와 같은 백엔드 기술 기반의 개발까지 폭넓게 지원하고 있다. 이뿐만 아니라 workspace 생성 시 Cypress, Jest 등을 기반으로 한 테스트 환경까지 설정해주기 때문에, 초기 모노레포 개발 환경 구축 비용을 크게 줄여준다.

그럼 Nx를 사용해서 간단하게 모노레포를 구성해 보고, 그 특징을 몇 가지 살펴보겠다.


### 새로운 Nx workspace 생성하기

아래의 명령을 입력해 새로운 Nx workspace 생성을 시작할 수 있다.

```shell
npx create-nx-workspace
```

Nx는 workspace 생성을 완료하기 위해, 다음과 같이 추가로 몇 가지 항목을 입력하도록 요구한다.
> Nx Cloud의 경우 필수는 아니다.

```shell
Workspace name (e.g., org name)     My-Workspace  
What to create in the new workspace angular  
Application name                    my-app  
Default stylesheet format           CSS  
Use Nx Cloud?                       No  
```

이 항목을 입력하고 나면 다음과 같은 구조의 Nx workspace가 생성된다.

<img src="/static/images/nx-workspace.png" width="300" />

생성된 workspace 구조에서 이를 구성하는 디렉터리의 특징을 간단히 알아보겠다.

* apps/*: 애플리케이션 프로젝트들이 위치한다. 우리가 처음에 생성한 애플리케이션도 여기에 들어있는 것을 볼 수 있다. Angular 기반으로 workspace를 생성했어도 꼭 Angular 프로젝트만 이 디렉터리에 들어갈 필요는 없으며 React 등 다른 프레임워크 기반의 코드도 공존할 수 있다.
* libs/*: 애플리케이션 전반에서 공통으로 사용할 코드를 여기에 작성한다.
* tools/*: 개발에 필요한 tooling script가 위치한다.

이제 생성한 애플리케이션을 실행해 보겠다. 애플리케이션은 다음과 같은 명령으로 실행할 수 있다.

```shell
npx nx serve <APP_NAME> // 주의: workspace 이름이 아닌 애플리케이션 이름  
```

만약 전역(global)에 Nx가 설치되어 있다면 다음과 같은 명령으로 애플리케이션을 실행할 수도 있다.

```shell
nx serve <APP_NAME> 
```

> 전역에 Nx 설치하기: npm install -g nx 또는 yarn global add nx


### 라이브러리 추가해보기

이번엔 애플리케이션 전반에서 사용할 수 있는 [라이브러리](https://nx.dev/nx-api/react/generators/library)를 추가해보겠다.

라이브러리는 목적과 특성에 따라 다음과 같이 네 가지로 나눌 수 있다.

* feature 라이브러리
* UI 라이브러리
* data-access 라이브러리
* utility 라이브러리

여기서는 간단하게 UI 라이브러리를 추가해 보겠다.

```shell
npx nx g @nrwl/angular:lib ui // ui: 라이브러리 이름  
```

```shell
npx nx g @nrwl/react:lib ui // React의 경우  
```

위 명령으로 ui라는 이름의 Angular 컴포넌트가 라이브러리에 추가되어 다음과 같은 구조가 만들어진다.

<img src="/static/images/nx-libs.png" />

이제 생성된 UI 라이브러리 구조에 실제 View 역할을 할 컴포넌트를 추가하겠다.

```shell
npx nx g component first-lib --project=ui --export  
```

다음 그림과 같이 ui 라이브러리 아래에 우리가 선언한 first-lib 컴포넌트 파일이 추가되었다.

<img src="/static/images/nx-component.png" />

그럼 이제 라이브러리를 애플리케이션에서 사용하는 방법을 알아보겠다. <br />
라이브러리를 import하는 구문은 다음과 같다.

```js
import UI_MODULE_NAME from '@WORKSPACE_NAME/LIBRARY_NAME'  // @my-app/ui/first-lib  import ui component
```

Nx는 라이브러리가 추가될 때마다 tsconfig.base.json 파일에 TS 경로를 매핑하기 때문에 위와 같이 참조할 수 있다.

pnpm + next.js 를 사용할 경우 아래와 같이 application을 추가 한다.
```shell
#Create new applications
pnpm nx g @nx/next:application <application-name>
```

js 라이브러리는 아래와 같이 추가한다.
```shell
#Create new libraries
pnpm nx g @nx/js:library <library-name>
```

### Nx가 제공하는 도구

1. Project Graph

첫 번째는 Project Graph이다. 대부분의 프로젝트는 성장하면서 수많은 애플리케이션과 라이브러리가 생겨나고 점차 그 구성 요소 간의 의존 관계가 복잡해져 개발자 입장에서는 그 의존 관계를 파악하기가 점점 어려워진다. Nx는 이를 시각화하여 프로젝트 구성 요소 간의 관계를 파악하기 쉽도록 하는 Project Graph를 제공한다.

```shell
npx nx graph  
```

위의 명령을 실행하여 현재 workspace의 전체 Project Graph를 확인할 수 있고, Nx가 제공하는 인터페이스를 통해 다양한 필터링도 가능하다.

2. Computation Caching

**Nx는 Nx CLI를 통해 내부적으로 Computation Caching을 제공한다.** 이를 확인해보기 위해 nx build [appName] 명령을 실행해 보겠다.

<img src="/static/images/nx-cache1.png" />

빌드가 완료된 후, 위와 동일한 명령을 한 번 더 실행해 보았다.

<img src="/static/images/nx-cache2.png" />

이번에는 빌드가 바로 완료됨(21ms)을 볼 수 있고, 맨 아래 텍스트에서 볼 수 있는 것처럼 Nx는 로컬 캐시에 해당 Artifact가 존재하는 경우 가져다 쓰는 걸 알 수 있다. 단, 캐싱은 Nx CLI에서만 동작하기 때문에, Angular CLI를 사용하는 경우엔 Computation Caching이 적용되지 않는다.

[NX Computation Caching](https://nx.dev/concepts/how-caching-works)

3. Affected

다음은 Affected 스크립트이다.

```shell
npx nx affected  
```

Nx는 코드를 수정했을 때 workspace의 어떤 부분이 영향을 받는지 알려주는 명령을 제공한다. Affected 스크립트는 필요에 따라 다음과 같이 다양하게 사용할 수 있다.

* npx nx affected:apps: 수정한 부분이 어떤 애플리케이션에 영향을 주었는지 표시한다.
* npx nx affected:libs: 수정한 부분이 어떤 라이브러리에 영향을 주었는지 표시한다.
* npx nx affected:test: 코드 수정에 의해 영향을 받은 부분에 대해서만 테스트를 실행한다.

다음은 UI 라이브러리를 수정한 뒤 위 명령을 실행한 모습이다.

<img src="/static/images/nx-affected.png" />

4. IDE Nx Console
IDE (vscode, intellij) 에서 Nx Console Plugin 설치하여 쉽게 Nx Command 를 사용할 수 있다.

---

### 참조

- [모던 프론트엔드 프로젝트 구성 기법 - 모노레포 도구 편](https://d2.naver.com/helloworld/7553804)
- [How To Build A Monorepo With The Nx Tool? A Full Nx Monorepo Tutorial](https://elitex.systems/blog/how-to-build-monorepo-with-nx-tool/)
