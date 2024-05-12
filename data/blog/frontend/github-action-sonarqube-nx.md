---
title: github action 을 통해 monorepo 프로젝트 sonarqube 연동하기 (with nx, pnpm)
date: '2024-05-03'
tags: ['sonarqube', 'nx', 'pnpm', 'monorepo', 'frontend', 'github-actions', 'ci']
draft: false
summary: '소나큐브는 20개 이상의 프로그래밍 언어에서 버그, 코드스멜, 보안 취약점을 발견할 목적으로 정적 코드 분석을 하여 지속적인 코드 품질 검사용 오픈소스 플랫폼이다.'
---

소나큐브는 20개 이상의 프로그래밍 언어에서 버그, 코드스멜, 보안 취약점을 발견할 목적으로 정적 코드 분석을 하여 지속적인 코드 품질 검사용 오픈소스 플랫폼이다.

정적분석 도구인 소나큐브를 사용하면서 얻는 이점은 아래와 같다.
* 리뷰어가 리뷰를 하는 데에 한계가 있기 때문에 추가된 코드들에 에러가 있는지 전부 직접 검토하지 않아도 된다.
* 기존 프로젝트 뿐만 아니라 새로운 코드에 대한 테스트 커버리지를 자동화 빌드 단계에서 확인할 수 있다.
* 여러 사람이 개발하여 스타일이 모두 다를 수 있지만 분석 도구의 정해진 규칙에 따라 분석하기 때문에 착오가 발생하지 않는다.

<img src="/static/images/sonar-works.png" />

위 그림이 sonarqube가 동작되는 방식이다.

    1) Intellij에서는 자체적으로 coverage를 계산할 수 있고 sonarqube를 적용하게 되면 로컬에서 sonarqube를 실행하여 커버리지 등을 분석할 수 있다.

    2) 추가한 코드를 Push하여 PR을 추가하거나 업데이트가 되면 GitHub action을 통해 sonar scanner를 실행시켜 신규 코드를 분석한다. 

    3) sonar scanner를 통해 분석한 코드에 대한 Report를 Sonarqube Server에 전달한다.

    4) Sonarqube Server에서 분석한 리포트를 받으면 페이지가 업데이트 되고 PR Decoration이 등록되어 있는 경우 해당 PR에 Decoration을 해준다.

    5) 개발자는 Sonarqube Page 또는 Decoration을 통해 coverage, code smell, code duplication등을 확인하여 관리할 수 있다.


### Github PR Report Decoration

다음과 같이 sonarqube에서 PR Decoration 설정을 해주어야 한다.

<img src="/static/images/pr-decoration.png" />

Project Setting > General Settings > DevOps Platform Integration

* Git Project에서 sonarqube pr decoration을 위한 GitHub App을 설치하여 추가해야 한다.

<img src="/static/images/pr-decoration2.png" />

* 세팅이 완료된 후 github action을 이용하여 sonar scanner를 정상적으로 실행시키면 아래와 같이 PR을 등록하거나 PR이 업데이트가 되면 아래와 같이 Report를 받을 수 있다.

<img src="/static/images/pr-decoration3.png" />


### Github Action with SonarQube

[sonarqube-scan-action](https://github.com/SonarSource/sonarqube-scan-action) 을 사용해서 Github action 에서 sonarqube scan 을 실행하였다.

test coverage 를 sonarqube 에서 확인하기 위해서는 `lcov` 포맷으로 coverage report 를 생성해서 전송해야 한다. <br />
설정 방법에 대해서는 [JavaScript/TypeScript test coverage](https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/test-coverage/javascript-typescript-test-coverage/)를 참고한다.

test coverage 가 성공적으로 전송되면 sonarqube에서 `Coverage, Line coverage, Condition coverage` 를 확인할 수 있다.
각각의 계산 방법에 대해서는 [metric-definitions](https://docs.sonarsource.com/sonarqube/latest/user-guide/metric-definitions/#tests)를 참고한다.

#### Github Action with SonarQube 설정

1. 먼저 github secret에 `SONAR_TOKEN`, `SONAR_HOST_URL`을 추가해야 한다.
2. 다음으로 github action에서 sonarqube scan을 실행하는 yaml 파일을 아래와 같이 작성한다.

```yaml
on:
  push:
    branches:
      - main
      - develop
      - 'release/**'
  pull_request:
    types: [opened, synchronize, reopened]
env:
  GIT_BASE_BRANCH: ${{ github.event.pull_request.base.ref }}
  GIT_HEAD_SHA: ${{ github.event.pull_request.head.sha }}
  EXCLUDE_TEST: 'research,app-router-playground'

name: sonarqube Workflow
jobs:
  sonarqube:
    runs-on: small
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version-file: '.nvmrc'

      - name: PNPM install
        uses: WebDev/actions/.github/actions/pnpm_install@main

      # pull_request 시에 변경된 프로젝트만 coverage 를 체크한다.
      - name: Generate pull_request coverages
        if: ${{ github.event_name == 'pull_request' }}
        run: |
          pnpm nx affected \
            --base=origin/$GIT_BASE_BRANCH \
            --head=$GIT_HEAD_SHA \
            -t test --parallel=3 --configuration=ci --exclude=$EXCLUDE_TEST --coverage --coverageReporters=lcov
        continue-on-error: true

      # push 시에 전체 project의 coverage 를 체크한다.
      - name: Generate all coverages
        if: ${{ github.event_name == 'push' }}
        run: |
          pnpm nx run-many \
            -t test --parallel=3 --configuration=ci --exclude=$EXCLUDE_TEST --coverage --coverageReporters=lcov
        continue-on-error: true

      - name: SonarQube Scan
        uses: sonarsource/sonarqube-scan-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

3. [sonarqube-scan-action 에서의 가이드](https://github.com/SonarSource/sonarqube-scan-action?tab=readme-ov-file#usage) 대로 `sonar-project.properties` 파일을 프로젝트 루트에 추가하여 sonarqube에 대한 설정을 정의한다. <br />
아래는 `sonar-project.properties` 파일의 예시이다. sonar scanner 타겟 소스, 제외할 파일, 소스 인코딩, test coverage lcov 파일 경로들을 설정한다.

```
sonar.projectKey=cms-web
sonar.sourceEncoding=UTF-8
sonar.sources=apps,libs
sonar.javascript.lcov.reportPaths=coverage/**/lcov.info
sonar.exclusions=**/*.css,**/*.scss,**/mocks/**
```

---

### 참조

* [sonarqube 공식문서](https://docs.sonarsource.com/sonarqube/latest/)
* [Automate SonarQube Scans with your GitHub Actions](https://devopstreet.com/automate-sonarqube-scans-with-your-github-actions/)
* [javascript-typescript-test-coverage](https://docs.sonarsource.com/sonarqube/latest/analyzing-source-code/test-coverage/javascript-typescript-test-coverage/)
* [정적 코드 분석 — SonarQube](https://techblog.tabling.co.kr/%EA%B8%B0%EC%88%A0%EA%B3%B5%EC%9C%A0-%EC%A0%95%EC%A0%81-%EC%BD%94%EB%93%9C-%EB%B6%84%EC%84%9D-sonarqube-6b59fa9b6b85)