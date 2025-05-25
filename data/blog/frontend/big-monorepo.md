---
title: 여러개 모노레포의 통합 - 하나의 대형 모노레포로의 전환
date: '2025-5-14'
tags: ['frontend', 'monorepo', 'nx', 'pnpm']
draft: false
summary: '팀에서 여러개의 모노레포를 하나의 대형 모노레포로 통합하는 작업을 진행하고 있다. 이를 통하여 기존에 같은 팀에서 여러 레포별로 중복된 설정들과 일관되지 않은 부분들을 통합하고자 한다.'
---

팀에서 여러개의 모노레포를 하나의 대형 모노레포로 통합하는 작업을 진행하고 있다.
이를 통하여 기존에 같은 팀에서 여러 레포별로 중복된 설정들과 일관되지 않은 부분들을 통합하고자 한다. <br />  
하나의 모노레포로 통합하게 되면서 CI/CD 파이프라인, Dependency Package 버전, ArgoCD manifest, 브랜치 전략, 공통 라이브러리 코드 등을 통합하게 된다.

팀에서 사용하는 모노레포 툴은 nx 를 사용하고 있으며, package manager 는 pnpm 을 사용한다. 그리고 ArgoCD 를 통해 배포를 관리한다.

## NX Organizational Decisions 문서 리뷰

진행 전에 통합을 위해 어떤 부분을 고려해야 할지 다음 문서들을 리뷰하였다.

* [Monorepo or Polyrepos](https://nx.dev/concepts/decisions/overview)
* [Why Monorepos](https://nx.dev/concepts/decisions/why-monorepos)
* [Dependency Management](https://nx.dev/concepts/decisions/dependency-management)
* [Code Ownership](https://nx.dev/concepts/decisions/code-ownership)
* [Project Size](https://nx.dev/concepts/decisions/project-size)
* [Project Dependency rules](https://nx.dev/concepts/decisions/project-dependency-rules)
* [Folder Structure](https://nx.dev/concepts/decisions/folder-structure)

추가로 https://monorepo.tools/ 에서 정의하는 monorepo 도구가 지원해야하는 기능들을 보고, 우리는 어떤 것들이 필요한지 검토한다.

## Ground Rules

다음으로 어떤 Ground Rules 를 가지고 통합을 진행할 것인지 정의한다. 

### 1. Action Usage

github action 을 통해 CI/CD 파이프라인을 정의한다.
기존에 각각 레포에서 PR create 시 build, test, lint, sonarqube, labelling, jira ticket update, affected check 등을 수행하고, PR merge 시에는 auto deploy 를 수행하고 있다. 

다른 부분들은 공통으로 정의된 action 레포를 참조하기도 하고 동일하게 구현되어 있으나, auto deploy 의 경우는 프로젝트 마다 모두 다른 정의를 하고 있다. <br />
이를 처리하기 위해 모노레포 통합시에 github action 에서 프로젝트 별로 분기를 하기에는 너무 복잡해질 것 같다. <br /> 
따라서 PR merge 시 auto deploy 를 다음과 같이 각 프로젝트에서 지정한 nx executor 를 github action 을 통해 호출되도록 한다.

<img src="/static/images/merge-github-action.png" />

deploy 에 필요한 custom executor 들을 정의하고 (aws deploy, docker build) 각 app 에서 선택적으로 수행한다. 

custom executors directory 
```
tools/
  └── src/
    └── executors/
        └── release/
            ├── aws/
            │   ├── executor.ts
            │   ├── schema.d.ts
            │   └── schema.json
            ├── docker/
            │   ├── executor.ts
            │   ├── schema.d.ts
            │   └── schema.json
            └── registry/
                ├── executor.ts
                ├── schema.d.ts
                └── schema.json
```

github action
```
runs:
  steps:
    - name: Build
      run: pnpm nx build {{ application }}
    - name: Deploy
      run: pnpm nx deploy {{ application }}
```

project.json
```json
{
  "registry-upload": {
    "executor": "@repo/tools:registry-upload",
    "options": {
      "bucketPath": "project/real/{sha}/_next/static",
      "syncDir": "dist/apps/project/_next/static"
    },
    "dependsOn": ["build"]
  },
  "docker-deploy": {
    "executor": "@repo/tools:docker-deploy",
    "options": {
      "registry": "docker.registry.com/project",
      "registryRepository": "my-web",
      "dockerfilePath": "apps/project/Dockerfile",
      "buildArgs": {
        "PHASE": "real"
      }
    },
    "dependsOn": ["build"]
  },
  "upload-manifest": {
    "executor": "@repo/tools:upload-manifest",
    "options": {
      "application": "project",
      "branch": "manifest-real"
    },
    "dependsOn": ["docker-deploy"]
  },
  "deploy": {
    "dependsOn": ["upload-manifest", "registry-upload"]
  }
}
```

<br />

### 2. Auto deploy rules

프로젝트 마다 자동 배포 룰이 다르기 때문에 이 부분도 github action 에서 프로젝트 별 분기보다는 각 프로젝트 설정에서 이를 체크하고, github action 은 공통으로 수행하는 방향으로 한다.

1. PR merge taget branch 명을 보고 어떤 환경 (alpha, beta) 에 자동배포 할지 결정하는 custom executor 를 정의한다.

2. 다음과 같이 project command 를 통해 1번의 custom executor 를 호출하여 자동배포 타겟 환경을 확인한다.

```
- name: Run pnpm nx and set output as environment variable
  id: nx_run
  run: |
    output=$(pnpm nx deploy-target {{ application }})
    echo "DEPLOY_TARGET=$output" >> $GITHUB_ENV

- name: Use the DEPLOY_TARGET variable
  run: echo "The output is $DEPLOY_TARGET"
```

3. 확인한 자동배포 타겟 환경을 label 로 지정하고, 이후 Deploy 시에 전달한다.

<br />

### 3. Folder Structure

폴더 구조는 다음과 같이 정리하였다.

```
apps/
├── group1/
│   ├── project1/
│   └── project2/
└── group2/
│   ├── project1/
│   └── project2/
└── group3/
    └── project1/
 
libs/
├── group1/
│   ├── node/
│   └── node-manager/
├── group2/
│   ├── feature-aa/
│   └── feature-bb/
├── shared/
│   ├── utils/
│   ├── style/
│   └── react/
│      ├── components/
│      └── hooks/
├── uts
└── fetch
 
tools/
└── src
    ├── executors
    └── generators
```

* apps
  * 프로젝트는 특정 그룹으로 묶을 수 있는 scope 를 두고 scope 하위에 생성한다.
  * 각 프로젝트 별 CODEOWNERS 는 프로젝트 담당자로 지정한다.
  * 각 프로젝트의 package.json 하위에 다음과 같이 프로젝트 그룹 scope 를 지정한다.
    ```json
    {
      "name": "@group2/project1"
    }
    ```
    위와 같이 name 을 지정하면 이 후 nx affected 와 같은 nx cli 에서도 해당 name 으로 동작한다.

* libs
  * \{project-group\}\/\{lib-name\}
    * 위의 apps 와 마찬가지로 특정 그룹으로 묶을 수 있는 scope 를 두고 scope 하위에 생성한다.
    * 특정 프로젝트 그룹에서만 사용되는 도메인 로직등을 별도로 lib 으로 분리하고 싶을 때 여기에 둔다.
    * CODEOWNERS : 프로젝트 담당자
    * package.json 하위에 다음과 같이 프로젝트 그룹 scope 를 지정한다.
        ```json
        {
          "name": "@group2/feature-aa"
        }
        ```
  * shared\/\{lib-name\}
    * 범용적으로 사용되는 유틸, 스타일, 컴포넌트 등을 정의한다.
    * 두개 이상의 프로젝트 그룹에서 사용되거나 사용될 가능성이 있는 부분들은 여기에 둔다.
    * (Recommend) 개발시에 unit-test, storybook 등을 활용하여 모듈 검증 및 사용방법에 대한 가이드를 제공한다.
    * CODEOWNERS : all
    * shared 코드 변경시에는 아래 "4. Shared library modify process" 의 프로세스를 따른다.
    * package.json 하위에 다음과 같이 scope 를 지정한다.
        ```json
        {
          "name": "@shared/utils"
        }
        ```
  * else
    * Library 관리가 가능한 모듈 (독립적으로 배포 가능한 모듈)
    * CODEOWNERS : all
    * 마찬가지로 코드 변경시에는 아래 "4. Shared library modify process" 의 프로세스를 따른다.
* tools
  * custom generator, executor 를 정의
  * CODEOWNERS : all

<br />

### 4. Shared library modify process

여러 프로젝트에서 공통으로 사용하는 libs 부분을 수정할 때는, 다른 프로젝트 담당자와도 협의가 필요하다. 따라서 수정시 다음과 같은 프로세스를 정의한다.

1) 변경에 대한 git issue 를 등록
   * [git issue template](https://github.com/minsgiman/nx-shops/blob/develop/.github/ISSUE_TEMPLATE/shared_request.md?plain=1)
   * 위의 template 의 Reviewer 부분에 검토해주어야 할 reviewer 를 지정한다.
2) 해당 git issue 를 통해 reviewer 와 협의가 되면 PR 등록

<br />

### 5. Manifest Strategy

#### 1) manifest directory structure

mono repo root manifest/ 경로 하위에 구성한다.

* templates
  * mono repo 내 프로젝트에서 공통으로 사용되는 helm chart로 manifest 구성
  * 프로젝트별 분기가 필요한 부분은 values내 정의된 변수들로 구성
* values
  * template 내 분기가 필요한 변수들로 구성 project
  * project, phase별 values 파일 유지

#### 2) manifest branch

* argoCD에서 동기화 하는 manifest branch를 개발 브랜치와 별도로 유지
* phase 별로 다른 manifest 설정이 필요한 케이스를 대비하여 아래처럼 phase별 manifest branch를 유지
  * manifest/dev : alpha, beta
  * manifest/rc : rc
  * manifest/real : real
* phase별로 해당하는 branch로 tag push 하도록 github action 구성

#### 3) 변경 반영 과정

* project내 코드 변경
  * deploy 시에 프로젝트별로 사용하는 docker registry 에 해당 버전에 대한 docker tag push
  * 해당하는 [project, phase] values 파일 내에  docker image tag 변경 후 해당하는 manifest branch로 commit
  * argoCD에서 values 변경사항 감지
* manifest 변경
  * develop 브랜치에서 manifest 파일 변경
  * 배포시 manifest/ 변경사항을 각 phase 별 manifest 브랜치에 동기화
  * argoCD에서 menifest 변경사항 감지

<img src="/static/images/manifest-update.png" />

<br />

### 6. Branch Strategy

기본적인 git flow 에서 다음과 같은 변화가 있다. 

* develop 은 제거하고, main 브랜치를 주 브랜치로 기존 develop 처럼 사용. (hotfix 도 main 으로부터 생성하지 않기 때문에 기존의 main 브랜치 역할이 없어진다.)

* hotfix 브랜치는 이전의 tagging 으로부터 만든다. -> main 으로부터 생성하면 여러 다른 프로젝트 수정들 때문에 위험할 수도 있다.

<img src="/static/images/monorepo-branch.png" />

<br />

### 7. NX CLI command name 공통 정의

nx 를 사용할때 project.json 에 다음과 같이 정의할 command 이름도 공통으로 맞춘다.

```json
{
  "type-check": {
    "executor": "nx:run-commands",
    "options": {
      "command": "pnpm tsc -p apps/group1/project1/tsconfig.json --noEmit"
    }
  }
}
```

* Create new applications (custom generator 를 정의한다.)
    ```
    /* nx g create-next-app <application-path> */
    nx g create-next-app apps/group1/project1
    ```

* Create new libraries (custom generator 를 정의한다.)
    ```
    /* nx g create-lib <library-path> */
    nx g create-lib libs/group1/feature-aa
    ```

* Library Move ( https://nx.dev/nx-api/workspace/generators/move#examples )
  ```
  /* Move libs/group1/node to libs/shared/node */
  nx g @nx/workspace:move --project @group1/node --destination shared/node
  ```

* Dev server
  ```
  /* nx run <application-name>:dev */
  nx run @group1/project1:dev
  ```

* Dev server with mock
  ```
  /* nx run <application-name>:dev-mock */
  nx run @group1/project1:dev-mock
  ```

* Production serve
  ```
  /* nx run <application-name>:serve */
  nx run @group1/project1:serve
  ```

* Typescript type check
  ```
  /* nx run <application-name>:type-check */
  nx run @group1/project1:type-check
  ```

<br />

### 8. Dependency Management

기본적인 정책은 모든 프로젝트가 같은 dependency 버전을 사용하는 Single Version Policy를 따른다. <br />
대신 점진적으로 전환하는 케이스도 고려하여 일부 경우는 각 프로젝트 독립적으로 dependency 를 관리하는 것을 허용한다. 하지만 궁극적으로는 모든 프로젝트가 같은 버전을 사용하는 방향을 추구한다.

nx 에서는 Single Version Policy 와 Independently Maintained Dependencies 모두 지원한다. <br />
( 참고 : [Dependency Management](https://nx.dev/concepts/decisions/dependency-management) )

우리는 두가지 전략 모두 지원하기 위해 nx 와 pnpm workspace 를 사용하였다. <br />
Independently Maintained Dependencies 를 위해 pnpm workspace 를 사용한다. 

다음과 같이 설정하였을 때, project1 에 별도로 추가한 디펜던시는 root 에 정의되어 있는 디펜던시와 merge 되어서 nx serve, build 모두 의도한 대로 잘 동작하게 된다.

apps/project1/package.json
```json
{
  "name": "project1",
  "version": "1.7.0",
  "dependencies": {
    "react": "^18.0.0"
  }
}
```

pnpm-workspace.yaml
```yaml
packages:
- 'apps/project1'
```

위와 같이 pnpm workspace 을 설정하고, root 에서 pnpm install 하였을 때 pnpm lock 파일에 project1 에 대한 별도 버전이 추가되는 것을 확인할 수 있다.

pnpm-lock.yaml 
```yaml
apps/project1:
  dependencies:
    'react':
      specifier: ^18.0.0
      version: 18.0.1
```