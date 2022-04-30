---
title: github actions 사용하기
date: '2022-05-01'
tags: ['ci', 'github', 'github-actions']
draft: false
summary: '추가적인 ci/cd툴을 사용하지 않고 깃허브 하나로 버전관리부터 테스트 배포까지 가능하다.'
---

### Github Action이란?

깃허브 저장소 내에서 코드 프로젝트를 빌드, 테스트, 패키지, 릴리스 또는 배포하기 위해 설정할 수있는 사용자 지정 자동화 프로세스이다. <br />
추가적인 ci/cd툴을 사용하지 않고 깃허브 하나로 버전관리부터 테스트 배포까지 가능하다.

### Github Action 정의

Github Action은 다음의 구조를 가진다.

<img src="/static/images/github-actions-flow.png" />

#### Workflow

프로젝트를 빌드, 테스트, 패키지, 릴리스 또는 배포하기 위한 전체적인 프로세스이다. <br />
워크플로우는 여러 개의 Job으로 구성되며 event(on)에 의해 실행된다. <br />
GitHub에게 나만의 동작을 정의한 workflow file를 만들어 전달하면 GitHub Actions가 그것을 보고 그대로 실행 시켜준다.

#### Job

Job은 하나의 인스턴스(리눅스, 맥, 윈도우 등등)에서 여러 Step을 그룹시켜 실행하는 역할을 한다. <br />
jobs: 하위에 여러개의 job을 선언할 수 있고 기본적으로 job들은 병렬로 실행이 된다. <br />
job간의 순서에 대한 종속성을 다음과 같이 설정할 수도 있다.

```
# test job은 build job이 완료된 후에 실행
test:
    needs: build
```

#### Step

Step은 순차적으로 명령어를 수행한다. 크게 Uses와 Run으로 작업 단위가 나뉘는데, Uses는 미리 정의한 action을 가져와 실행하는 것이고, Run은 npm install나 mkdir example과 같이 가상환경 내에서 실행할 수 있는 스크립트를 말한다. <br />

#### Action

workflow의 가장 작은 블럭이다. 재사용이 가능한 컴포넌트로서 반복적인 코드의 양을 줄일 수 있고 git repository를 가져오거나 클라우드 공급자에게 인증을 설정할 수도 있다. <br />
직접 만들수도 있고, 이미 다른 사람들이 정의해둔 action도 사용할 수 있는데, github -> marketplace -> types -> actions 에 가보면 어떤 것들이 있는지 확인해볼 수 있다.

#### Event

워크플로우를 실행시키는 조건을 설정한다. <br />
예를 들어 해당 레포지토리에 Code가 push 됐을때만, 또는 풀리퀘했을 때, 또는 master branch에 변경사항이 있었을 때 등으로 조건을 줄 수 있다. <br />
물론 cron 처럼 주기적으로 스케쥴링하는 방법 또한 지원한다.

#### Runners

runner는 workflow가 트리거될 때 실행하는 서버다. 각 runner는 1번에 1개의 job을 실행할 수 있다. <br />
Github에서 호스팅해주는 Github-hosted runner와 직접 호스팅하는 Self-hosted runner로 나뉜다. <br />
Github-hosted runner는 Azure의 Standard_DS2_v2로 vCPU 2, 메모리 7GB, 임시 스토리지 14GB이다.

<br />

### 실습

#### PR 단위 실행 및 slack notify

다음을 참고하여 진행하였다.

- [카카오웹툰은 GitHub Actions를 어떻게 사용하고 있을까?](https://fe-developers.kakaoent.com/2022/220106-github-actions/)
- [GitHub Actions 활용하기](https://devblog.croquis.com/ko/2020-11-06-1-using-github-actions/)

https://github.com/minsgiman/actions-test 에서 확인할 수 있다.

<br />

#### job분리, 라벨링, 코멘트 자동화

다음을 참고하여 진행하였다.

- [Matrix설명과 job분리](https://www.youtube.com/watch?v=VhOKYqEzdwE)
- [build-in 스토리지 활용하여 분리된 가상환경인 job간의 빌드결과물 공유](https://www.youtube.com/watch?v=mipyHbipkCQ)
- [PR에 상태에 따른 라벨링 자동으로 하기](https://www.youtube.com/watch?v=TRsgxkBW1Q0&list=LL&index=2)
- [Issue에 상태에 따른 코멘트 자동으로 달기](https://www.youtube.com/watch?v=7I-gpWVCMuk)

https://github.com/minsgiman/actionsdemo 에서 확인할 수 있다.

<br />

#### Pull Reqeust 리뷰 강제화하기

Github의 Settings - Branches - Branch protection rules 에서 다음과 같이 룰을 추가해주어 PR 리뷰가 승인되었을때 merge 가능하도록 강제화할 수 있다.

<img src="/static/images/branch-protect-rule-1.png" />
<img src="/static/images/branch-protect-rule-2.png" />

status checks의 "Test lint, tsc, build" 는 등록한 github actions의 job 이름이다. <br />
해당 job의 수행을 한번 완료하고 나면 status checks에서 추가가 가능하다.

<br />

### Gihub Actions 공부하기 좋은 곳

- [공식 문서](https://docs.github.com/en/actions)
- [github learning lab](https://lab.github.com/)
- [microsoft learn](https://docs.microsoft.com/ko-kr/learn/)
