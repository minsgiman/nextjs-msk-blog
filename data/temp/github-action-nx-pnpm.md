---
title: github action 을 통해 monorepo 프로젝트 CI 구축하기 (with nx, pnpm)
date: '2024-03-02'
tags: ['nx', 'pnpm', 'monorepo', 'frontend', 'github-actions', 'ci']
draft: false
summary: 'pnpm, nx와 github action을 사용하여 frontend 프로젝트 CI 파이프라인을 구축하는 방법을 알아보자.'
---

pnpm, nx와 github action을 사용하여 frontend 프로젝트 CI 파이프라인을 구축하는 방법을 알아보자.

[공식 문서 가이드](https://nx.dev/ci/intro/tutorials/github-actions) 를 참고하여 https://github.com/minsgiman/nx-shops 에서 테스트를 진행해보았다.

프로젝트에서 적용한 버전은 아래와 같다.

Pull Request 시에 다음의 github action yaml 파일을 통해 lint, test, build를 수행하도록 설정한다. <br />
[nx affected](https://fig.io/manual/nx/affected)를 통해 영향받은 프로젝트만 수행한다. 그리고 exclude 옵션을 통해 ci에서 제외할 프로젝트를 설정한다.

```yaml
# pr 시에 동작
on: pull_request

env:
  # --base : Base of the current branch (usually develop)
  # --head : Latest commit of the current branch (usually HEAD)
  GIT_BASE_BRANCH: ${{ github.event.pull_request.base.ref }}
  GIT_HEAD_SHA: ${{ github.event.pull_request.head.sha }}

    # nx affected 명령어에서 제외할 프로젝트 목록
  EXCLUDE_LINT: 'research,app-router-playground'
  EXCLUDE_TEST: 'research,app-router-playground'
  EXCLUDE_BUILD: 'research,app-router-playground'

jobs:
  # lint, test, build 를 병렬로 수행
  lint:
    runs-on: small
    steps:
      - name: Checkout
        uses: actions/checkout@/v3
        with:
          fetch-depth: 0

      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version-file: '.nvmrc'

      # Reusable action for pnpm install 을 사용
      - name: PNPM install
        uses: WebDev/actions/.github/actions/pnpm_install@main

      - name: Verify Lint
        run: |
          pnpm nx affected --base=origin/$GIT_BASE_BRANCH --head=$GIT_HEAD_SHA -t lint --parallel=3 --exclude=$EXCLUDE_LINT

  test:
    runs-on: small
    steps:
      - name: Checkout
        uses: actions/checkout@/v3
        with:
          fetch-depth: 0

      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version-file: '.nvmrc'

      - name: PNPM install
        uses: WebDev/actions/.github/actions/pnpm_install@main

      - name: Verify Unit Test
        run: |
          pnpm nx affected --base=origin/$GIT_BASE_BRANCH --head=$GIT_HEAD_SHA -t test --parallel=3 --configuration=ci --exclude=$EXCLUDE_TEST

  build:
    runs-on: small
    steps:
      - name: Checkout
        uses: actions/checkout@/v3
        with:
          fetch-depth: 0

      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version-file: '.nvmrc'

      - name: PNPM install
        uses: WebDev/actions/.github/actions/pnpm_install@main

      - name: Verify Build
        run: |
          pnpm nx affected --base=origin/$GIT_BASE_BRANCH --head=$GIT_HEAD_SHA -t build --parallel=3 --exclude=$EXCLUDE_BUILD
```

다음은 pnpm install을 수행하는 github action yaml 파일이다. reuseable action으로 만들어 사용한다.

```yaml
name: PNPM install
description: Run pnpm install with cache enabled

inputs:
  use-cache:
    description: 'use cache dependencies'
    required: false
    default: 'false'

runs:
  using: composite
  steps:
    - name: Enable corepack
      shell: bash
      run: |
        corepack enable
        echo "corepack enabled"
    - name: Get pnpm store directory
      if: ${{ inputs.use-cache == 'true' }}
      id: pnpm-config
      shell: bash
      run: |
        echo "STORE_PATH=$(pnpm store path)" >> $GITHUB_OUTPUT
    - name: Restore cached dependencies
      if: ${{ inputs.use-cache == 'true' }}
      id: restore-cache
      uses: actions/cache/restore@v3
      with:
        path: ${{ steps.pnpm-config.outputs.STORE_PATH }}
        key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}

    - name: Install dependencies
      shell: bash
      run: pnpm install --frozen-lockfile

    - name: Cache dependencies
      if: ${{ (steps.restore-cache.outputs.cache-hit != 'true') && (inputs.use-cache == 'true') }}
      uses: actions/cache/save@v3
      with:
        path: ${{ steps.pnpm-config.outputs.STORE_PATH }}
        key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
```


---

### 참조

- https://blog.banksalad.com/tech/github-action-npm-cache/

