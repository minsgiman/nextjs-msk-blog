---
title: Git repository 복사하기 (history 까지 통째로)
date: '2018-03-08'
tags: ['git']
draft: false
summary: 'Create a bare clone of the repository. Mirror-push to the new repository. Remove the temporary local repository you created earlier.'
---

#### 1. Open Terminal

#### 2. Create a bare clone of the repository.

```cmd
$ git clone --bare https://github.com/exampleuser/old-repository.git
```

#### 3. Mirror-push to the new repository.

```cmd
$ cd old-repository.git
$ git push --mirror https://github.com/exampleuser/new-repository.git
```

#### 4. Remove the temporary local repository you created earlier.

```cmd
$ cd ..
$ rm -rf old-repository.git
```

---

### 참조

- [Duplicating a repository](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/duplicating-a-repository)
