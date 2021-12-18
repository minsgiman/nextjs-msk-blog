---
title: Jenkins Multibranch Pipeline 만들기 (with GitHub)
date: '2020-11-11'
tags: ['jenkins', 'git', 'ci']
draft: false
summary: 'Jenkins create job에서 Multibranch Pipeline Job 을 생성한다.'
---

#### 1. Jenkins create job에서 Multibranch Pipeline Job 을 생성한다.

#### 2. Credentials 추가

- 'Credentials' > 'Jenkins'(Job scope로 설정하려면 Job선택) > 'Global credentials' > 'Add Credentials' 이동
  - 'Username with password’ 선택
  - Git Username, password 입력하여 추가

#### 3. Branch Sources 설정

- Type을 GitHub로 선택
- Project Repository : Git Repository를 입력한다.
- Credentials : 위에서 추가한 Credential 설정
- Behaviours
  - Discover branches
    - Job을 수행할 Branch를 설정한다.
    - Filter by name (with regular expression) 을 선택
    - regular expression 설정 ex. : (master|develop|release._|hotfix._|PR-.\*)

#### 4. Build Configuration 설정

- Mode : by Jenkinsfile 설정
- Script Path: Jenkinsfile (default) 로 설정하면 repository에서 Jenkinsfile을 찾아서 수행한다.

---

### 참조

- [Run Jenkins in Docker Container](https://www.youtube.com/watch?v=tuxO7ZXplRE)

- [gitHub와 Jenkins 연결하기](https://bcho.tistory.com/1237)

- [behavior_options_for_github_branch_sources](https://docs.cloudbees.com/docs/admin-resources/latest/pipelines/pipeline-as-code#_behavior_options_for_github_branch_sources)
