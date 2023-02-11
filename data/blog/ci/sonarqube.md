---
title: SonarQube로 정적 코드 분석하기
date: '2023-02-12'
tags: ['sonarqube', 'ci']
draft: false
summary: 'SonarQube를 통한 정적 코드 분석, 설치 방법, GitHub와 연결하기'
---

### SonarQube를 통한 정적 코드 분석

- 코드를 실행하지 않고 분석하며 메모리 누수 또는 버퍼 오버플로우 등 일반적으로 알려진 오류 및 취약점 파악 및 표준 코딩 적용에 관한 내용을 분석
- 변경된 코드에 관한 피드백 가능
- 자동화된 검사로 코드 품질을 유지하는데 도움을 주고 기본적인 코드 리뷰 시간 절감 가능
- 프로그래밍된 규칙 위반 사례만 식별 가능하여 실행 시 발생할 오류에 대한 부분이나 예외 사항이 있거나 잘못된 정보를 제공할 가능성이 있어 결과에 대한 확인 필요함

### SonarQube 특징

##### 1. 지속적인 인스펙션

- 지속적인 통합과 같이 빌드와 연동하여 지속적으로 코드에 대한 인스펙션을 수행합니다.

##### 2. 품질 중앙화

- 개발 조직의 코드 품질을 중앙 저장소에서 가시화하고 단일 위치에서 관리합니다.

##### 3. DevOps와의 통합

- 다양한 빌드 시스템, CI 엔진과 통합되어 DevOps 실천을 지원합니다.

##### 4. 품질 요구사항 설정

- 품질 게이트를 통해 표준화된 코드 품질 요구사항을 설정합니다.

##### 5. 다중 언어 분석

- 20개가 넘는 프로그램 언어에 대한 코드 분석을 지원합니다.

##### 6. 플러그인을 통한 확장

- 다수의 플러그인을 통해 SonarQube의 기능을 확장할 수 있습니다.

> 참고로 기본적으로 커뮤니티 버전은 master(메인) 브랜치만 지원하는데 여러 브랜치나 PR에도 적용 가능한 [플러그인](https://github.com/mc1arke/sonarqube-community-branch-plugin)을 설치하면 제약이 없어집니다.

### SonarQube 설치

SonarQube 설치는 파일로 설치해서 실행하는 방법과 도커를 사용해서 실행하는 방법이 있습니다. ( [링크](https://docs.sonarqube.org/9.6/try-out-sonarqube/) )

도커로 실행하도록 하겠습니다. 실행 시 별도의 db를 설정해서 연결하지 않으면 서버를 재실행 시 모든 설정값들이 초기화가 되므로 docker-compose를 이용해서 실행하도록 하겠습니다. 참고로 SonarQube 이미지는 위에서 설명한 모든 브랜치를 이용 가능한 플러그인이 포함된 이미지로 작업했습니다. 공식 이미지 사용하고 별도로 플러그인을 설치하셔도 무방합니다.

```
version: "3"
services:
  sonarqube:
    image: mc1arke/sonarqube-with-community-branch-plugin
    hostname: sonarqube
    container_name: sonarqube
    depends_on:
      - db
    environment:
      SONAR_JDBC_URL: jdbc:postgresql://db:5432/sonar
      SONAR_JDBC_USERNAME: sonar
      SONAR_JDBC_PASSWORD: sonar
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs
    ports:
      - "9000:9000"
  db:
    image: postgres:13
    hostname: postgresql
    container_name: postgresql
    environment:
      POSTGRES_USER: sonar
      POSTGRES_PASSWORD: sonar
      POSTGRES_DB: sonar
    volumes:
      - postgresql:/var/lib/postgresql
      - postgresql_data:/var/lib/postgresql/data

volumes:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_logs:
  postgresql:
  postgresql_data:
```

### GitHub에 SonarQube App 설정

GitHub 에 푸시되거나 PR 생성 시 코드 분석을 위해 SonarQube 앱 설정이 필요합니다. ( [링크](https://docs.sonarqube.org/9.6/devops-platform-integration/github-integration/) )

1. GitHub에서 settings > Developer Settings > GitHub Apps 메뉴에서 New GitHub App 메뉴를 누릅니다.
2. 앱의 제목 및 설명 그리고 홈페이지 주소와 Callback Url에 SonarQube를 설치한 서버의 주소를 입력합니다.

<img src="/static/images/sonar-github.webp" width="600" />

3. SonarQube를 사용하기 위한 저장소 권한을 설정합니다.

<img src="/static/images/sonar-github-storage.webp" width="600" />

### SonarQube에 프로젝트 설정

이제 설치한 SonarQube에서 코드 분석을 할 GitHub 프로젝트를 등록합니다.

1. 설치한 SonarQube 주소를 입력해서 접속하게 되면 로그인 화면이 나옵니다.(초기 관리자 계정은 admin/admin 입니다.)

2. 처음 로그인을 하면 GitHub 연동을 위한 초기 설정화면이 나옵니다. GitHub App에 등록한 정보들을 맞게 입력해주시면 됩니다.

<img src="/static/images/sonar-config.webp" width="600" />
<img src="/static/images/sonar-config2.webp" width="600" />

3. 초기 설정을 마치면 GitHub App에 연동된 조직명이 나오고 조직을 선택하면 등록된 저장소 목록이 보입니다. 그 중 코드 분석을 진행할 저장소를 선택하면 됩니다.

4. ci나 local로 분석할 것이냐 선택이 나오지만 기본적으로 토큰을 생성하는 방법은 동일합니다.

<img src="/static/images/sonar-token1.webp" width="600" />
<img src="/static/images/sonar-token2.webp" width="600" />

### GitHub Actions

특정 브랜치에 머지를 하거나 PR을 요청할 경우 GitHub Actions를이용해서 코드 분석이 자동으로 실행하게 합니다. 그러기 위해 workflow 파일을 작성합니다. 테스트에 사용한 코드는 아래와 같습니다.

##### 1. PR workflow 파일

```
name: Code Analyze Pull Request

on:
  pull_request:
    types: [opened, reopened, synchronize]
    branches:
      - master
      - develop
env:
  NODE_VERSION: 18.12.0

jobs:
  code_analysis:

    runs-on: ubuntu-latest

    steps:
      - name: 'Checkout repository on branch: ${{ github.REF }}'
        uses: actions/checkout@v3
        with:
          ref: ${{ github.HEAD_REF }}

      - name: Retrieve entire repository history
        run: |
          git fetch --prune --unshallow

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Cache node modules
        uses: actions/cache@v3
        id: npm-cache
        with:
          path: '**/node_modules'
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      - name: Install Dependencies
        if: steps.npm-cache.outputs.cache-hit != 'true'
        run: npm install

      - name: Coverage Test
        continue-on-error: true
        run: npm run coverage

      - name: Run an analysis of the ${{ github.REF }} branch ${{ github.BASE_REF }} base
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_URL }}
```

##### 2. 특정 브랜치 Push workflow

```
name: Code Analyze branch

# then define on which event, here a push
on:
  push:
    # and the target with some regex to match our specific  branch names
    branches:
      - master
      - develop

# We can now build our job
jobs:
  code_analysis:

    runs-on: ubuntu-latest

    steps:
      - name: 'Checkout repository on branch: ${{ github.REF }}'
        uses: actions/checkout@v3
        with:
          ref: ${{ github.REF }}
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Cache node modules
        uses: actions/cache@v3
        id: npm-cache
        with:
          path: '**/node_modules'
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      - name: Install Dependencies
        if: steps.npm-cache.outputs.cache-hit != 'true'
        run: npm install

      - name: Coverage Test
        continue-on-error: true
        run: npm run coverage

      - name: 'Run an analysis of the ${{ github.REF }} branch'
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_URL }}
```

3. GitHub Actions에 설정한 값 외에 설정이 필요할 경우 각 프로젝트 루트 경로에 sonar-project.properties 파일에 지정해두면 됩니다.

sonar-project.properties

```
sonar.projectKey=webapp
sonar.projectName=webapp
sonar.ws.timeout=300
sonar.sources=src
sonar.exclusions=**/*.stories.*,**/__snapshots__/**,**/test/**,**/tests/**,**/xlt/**,**/lib/**,**/languages/**,**/assets/**
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.test.js,**/*.spec.ts,**/*.spec.tsx,**/*.spec.js
sonar.testExecutionReportPaths=tests/coverages/reports/unit/test-sonar-report.xml,tests/coverages/reports/storybook/test-sonar-report.xml
sonar.javascript.lcov.reportPaths=tests/coverages/reports/unit/lcov.info,tests/coverages/reports/storybook/lcov.info
sonar.eslint.reportPaths=eslint.json
sonar.typescript.tsconfigPath=tsconfig.json
```

4. PR을 등록 시 자동으로 GitHub Actions가 실행되고 분석이 끝나면 SonarQube에서 결과를 PR 코멘트에 남깁니다.

### SonarQube 결과 확인

로컬이나 GitHub를 통해서 코드 분석을 진행했을 경우 설치한 SonarQube 페이지에서 각 브랜치 별, PR 별 결과확인이 가능합니다.

결과에는 버그로 인식되는 부분, 취약점, 보안 관련, 코드 악취 및 수정하는데 드는 기술부채를 시간으로 보여주고 커버리지 파일도 같이 지정을 해두면 코드의 커버리지 및 중복 코드에 대한 정보를 보여줍니다.

각 프로젝트나 전체 환경설정에서 분석하거나 제외 될 소스 확장자나 경로를 지정 가능해서 원하지 않는 분석 결과나 분석에 소요되는 시간을 줄일 수 있습니다. ( [분석 범위 좁히기](https://sonarqubekr.atlassian.net/wiki/spaces/SON/pages/428055) )

---

### 참조

- [정적 코드 분석 — SonarQube](https://techblog.tabling.co.kr/%EA%B8%B0%EC%88%A0%EA%B3%B5%EC%9C%A0-%EC%A0%95%EC%A0%81-%EC%BD%94%EB%93%9C-%EB%B6%84%EC%84%9D-sonarqube-6b59fa9b6b85)

- [sonarQube공식문서(영문)](https://docs.sonarqube.org/latest/)

- [한글 가이드](https://sonarqubekr.atlassian.net/wiki/spaces/SON/overview)
