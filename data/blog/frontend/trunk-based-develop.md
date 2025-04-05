---
title: Trunk-based Development
date: '2025-03-29'
tags: ['monorepo', 'trunk-based-development']
draft: false
summary: '현재 팀에서 여러개의 모노레포 프로젝트를 하나의 커다란 모노레포 프로젝트로 통합하는 작업을 진행하고 있다. 이 과정에서 어떤 브랜치 전략이 적합할지에 대해 고민하게 되었고, 대안 중 하나인 Trunk-based Development 에 대해 알아 본다.'
---

현재 팀에서 여러개의 모노레포 프로젝트를 하나의 커다란 모노레포 프로젝트로 통합하는 작업을 진행하고 있다. <br />
이 과정에서 어떤 브랜치 전략이 적합할지에 대해 고민하게 되었고, 대안 중 하나인 Trunk-based Development 에 대해 알아 본다. <br />
거대한 모노레포를 운영하고 있는 구글, 페이스북에서도 trunk-based development 를 사용하고 있다. (참고 : https://dl.acm.org/doi/pdf/10.1145/2854146)

## git flow 에서 가지고 있는 문제

### 1. Painful Merge

#### 1) 기본적으로 브랜치 관리가 복잡하고, 이로 인해 merge 과정도 복잡하다.

예상되는 상황

1. release 브랜치가 3개 열려 있는 상태에서 공통 lib 에서 이슈가 발견되어 hotfix 브랜치를 만들어 수정한다.
2. hotfix 브랜치는 main, develop, release 3개 5번의 merge 가 필요하다.

#### 2) long-lived branch 가 자주 발생하고, 이는 수많은 merge conflict 를 발생시키면서 리팩토링 등을 어렵게 만든다.

<img src="/static/images/long-lived-branch.png" />

예상되는 상황

1. release 브랜치를 만들고 여기에서 많은 수정들이 발생. 이후 배포가 3달 동안 지연되어 merge 되지 못하고 있음.
2. 그 사이 develop 과 main 브랜치에는 여러 프로젝트들에 의해 리팩토링 등 많은 변경사항이 있었음.
3. 위에서 만든 long lived release branch 를 develop, main 에 merge 하는 과정은 어렵고 예상치 못한 이슈를 발생시킬 수 있다. 이는 발견되지 못하고 배포될 수 있음.

수 많은 프로젝트가 생길수록 merge conflict 로 인해 리팩토링, 라이브러리 버전 업데이트 등은 점점 어려워질 수 있음.

### 2. 코드 리뷰 어려움 야기

브랜치가 오래 유지되어서 변경사항이 많으면, 주 브랜치에서 변경된 컨텍스트와 충돌이 발생하면서 코드리뷰에 어려움이 생길 수 있다.


## Trunk-based Development

### Trunk-based Development 가 무엇인가?

<img src="/static/images/trunk-based.png" />

main(trunk) 라는 주 브랜치 하나만 운영하는 방식이다. <br />
작업은 main 에서 이루어지거나, 몇일 내 (short-lived branch)로 main 으로 머지할 feature 브랜치에서 진행한다. <br />
main 브랜치는 항상 배포 가능한 상태를 유지해야 한다.

feature, release, hotfix 도 존재하지만 다음과 같은 차이가 있다.
* feature : 가능한 짧게 유지하고, main 에서 생성하고, 머지한다.
* release : 모든 수정은 main 에서 진행하고, release 브랜치로 필요한 부분만 cherry-pick 한다.
* hotfix : release 와 동일하나, 안정성을 위해 마지막에 release 한 tag 에서 hotfix 브랜치를 생성하는 방식도 고려할 수 있다.

### 어떻게 운영해야 하나?

<img src="/static/images/trunk-based-how.png" />

* PR 은 가능한 작은 작업 단위를 가져야 하며, 모든 commit 은 releasable 해야 한다.
* 장기간 지속되어야 하는 feature 는 feature flag 를 두어 기능을 on/off 한다.
* 자동화된 효과적인 테스트 전략 필요


### release flow

* release 브랜치 생성 시, 모든 수정은 main 에서 진행하고, release 브랜치로 필요한 부분을 cherry-pick 한다. 
  * main에 없는 commit이 release 에 존재해서는 안됨
* release 브랜치는 main 으로 merge 하지 않는다. 
* release 완료 후 release branch 에서 version tagging

<img src="/static/images/trunk-based-release.png" />


### hotfix flow

* hotfix 도 release flow 와 동일하게 main 에서 진행하고, hotfix 브랜치로 cherry-pick 한다.
* **안정성을 위해 이전에 release 한 tag 에서 hotfix 브랜치를 생성하는 방식**도 고려할 수 있다.

### feature flag

feature flag 를 통해 기능을 on/off 하는 방식으로, 작업이 완료되지 않거나 사용자에게 노출되지 않아야 하는 feature 를 disable 할 수 있다.

* feature flag 는 가능한 적게 사용하고, 완료되면 제거된다. 
* **hotfix 를 release 한 tag 에서 진행한다면, feature flag 는 거의 사용하지 않고, 한 프로젝트에서 장기 개발 진행하는 feature 가 있는 동시에 release 를 진행하는 경우에만 사용하게 되지 않을까..**

<img src="/static/images/trunk-based-feature-flag.png" />


## git flow 와 장단점 비교

### 장점

<img src="/static/images/trunk-based-benefit.png" />

### 단점

* main 에서 수정하고, cherry-pick 하는 방식은 번거로움이 있을 수 있다.
* feature flag 를 두기 위한 공수가 필요하다.
* 버그가 main 에 바로 반영될 수 있다. -> hotfix 를 release 한 tag 에서 진행한다면 괜찮지 않을까?

--- 

## 참고

* https://www.youtube.com/watch?v=hL1OZfgoZGk&list=LL&index=2
* https://qeunit.com/blog/how-google-does-monorepo/
* https://trunkbaseddevelopment.com/