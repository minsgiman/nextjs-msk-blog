---
title: Git Command
date: '2020-04-28'
tags: ['git']
draft: false
summary: 'remote | branch flow | commit | stash | squash | tag | useful command'
---

### remote

- **git remote -v** : 현재 원격 저장소 확인

- **git remote add upstream https://github.com/ORIGIN_OWNER/ORIGIN_REPO.git** : upstream이란 이름으로 Fork대상인 원래 저장소를 원격저장소로 추가

- **git remote update** : 원격 브랜치에 접근하기 위해 remote 갱신

### branch flow

- **git checkout -b bfm-100 --track upstream/feature-user** : upstream/feature-user 브랜치에서 작업 브랜치(bfm-100)를 생성

- **git commit -m "BFM-100 로그인 작업"** : 작업 브랜치에 변경사항 커밋

- **git rebase -i HEAD~2** : 마지막 커밋 2개 하나로 합치기 (squash)

- **git pull --rebase upstream feature-user** : upstream/feature-user를 작업 브랜치에 rebase한다.

- **git push origin bfm-100** : 작업 브랜치를 origin에 bfm-100브랜치로 push

### commit

- **git commit --amend -m "nice!"** : 마지막 commit 메시지를 변경한다.

- 마지막 commit에 메시지 변경하지 않고 파일을 add한다.

  - **git add .**
  - **git commit --amend --no-edit**

- **git commit -am "that was easy"** : 자동으로 현재 디렉토리의 변경 파일들을 add 하고 commit 한다.

- **git log --graph --oneline --decorate** : 보기좋게 git commit log 확인

- **git revert "해당commit"** :  현재까지 남긴 이력들을 유지한 채 되돌리고 싶은 commit으로 원상복귀시키는 것(복구commit이 추가됨)

- **git reset --hard "해당commit"** : 해당commit으로 되돌리고 그 이후의 commit들은 모두 지워버린다.

- **git push --force** : 강제로 푸쉬

### stash

- **git stash** : working directory에서 변경사항을 제거하고 저장해놓는다. (commit없이)

- **git stash pop** : 저장해놓은 변경사항을 가져온다.

- **git stash save cool** : cool 이라는 이름으로 변경사항을 저장한다.
- **git stash list** : 저장해놓은 stash 목록을 확인한다. 불러오려는 stash의 인덱스를 확인한다.
- **git stash apply 0** : list에서 확인한 인덱스를 통해 저장한 내용을 불러온다.

### squash

- **git rebase --interactive** :
  - 대화형으로 commit 히스토리 수정
  - 현재 작업중인 브랜치의 최신 커밋을 가리키는 HEAD 포인터를 이동시킬 수 있다는 특성을 이용하여 commit 히스토리를 수정한다.
  - vim commit 리스트 편집에서 유지하고자 하는 commit은 pick, 이전 커밋과 합치려는 commit은 squash로 바꿔준다.

### tag

- **git tag 1.0.0** : 현재 HEAD에 태그 1.0.0 추가

- **git push origin 1.0.0(tag 이름)** : 태그 올리기

### useful command

- **git config --global alias.ac "commit -am"** : 커맨드 alias를 만든다. (git ac "notice!" 와 같이 사용할 수 있다.)

- **git merge --no-ff upstream/develop** : 현재 브랜치에 upstream/develop 브랜치를 merge (--no-ff옵션을 주면 항상 merge커밋을 만들어 merge한다. tree에서 merge기록을 확인하기 쉽다.)

- **git branch -m 변경전\_branch_name 새로운\_branch_name** : Git 브랜치 이름 변경

---

### 참조

- [우린 Git-flow를 사용하고 있어요](https://woowabros.github.io/experience/2017/10/30/baemin-mobile-git-branch-strategy.html)

- [13 Advanced (but useful) Git Techniques and Shortcuts](https://www.youtube.com/watch?v=ecK3EnyGD8o)

- [GitHub 프로젝트 패키지 릴리즈](https://devgwang.tistory.com/50)
