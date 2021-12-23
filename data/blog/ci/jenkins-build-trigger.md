---
title: Jenkins Build Trigger (with GitHub)
date: '2019-02-12'
tags: ['jenkins', 'ci', 'git']
draft: false
summary: 'Jenkins와 GitHub 연결 | Jenkins Job 생성 | PR hook 설정'
---

### Jenkins와 GitHub 연결

- GitHub Setting > Developer settings > Personal access tokens > Generate new token
- 토큰으로 접근할 수 있는 범위를 설정한다. 접근 범위는 "repo"와 "admin:repo_hook" 을 선택한다.
- Jenkins 관리 -> 시스템 설정 -> GitHub 에서 credentials add
  - Kind를 Secret text로 선택.
  - Secret에는 앞에서 생성한 GitHub Token을 입력.
  - ID는 GitHub id 입력.
  - Test Connection 버튼을 눌러서 제대로 github와 연결이 되는지 테스트.
- Jenkins 관리 -> 시스템 설정 -> Github Pull Request Builder 도 GitHub와 동일하게 설정. (Github Pull Request Builder 플러그인 설치 필요)

### Jenkins Job 생성

- Jenkins > New Item > Select 'Pipeline'
- Job 설정 - Build Triggers > Check 'GitHub hook trigger for GITScm polling'
- Job 설정 - Pipeline
  - Definition: Pipeline script from SCM
  - SCM : Git
  - Repository URL : Git 프로젝트 url
  - Credentials(해당 repository에 연결할 정보 입력 필요) : add 눌러서 Kind를 Username with password로 선택하고, Username에는 본인의 github id, Password에는 github 비밀번호를 입력

### PR hook 설정

- GitHub repo 설정 > Webhooks > "jenkins_url/github-webhook/" 추가.

---

### 참조

- [Trigger Jenkins Build automatically](https://www.youtube.com/watch?v=CmwTPxdx24Y)

- [Jenkins와 gitHub 연동](https://bcho.tistory.com/1237)

- [Github PR시 Jenkins를 통한 빌드 자동화](https://forl.tistory.com/m/139)
