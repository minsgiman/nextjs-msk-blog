---
title: Turborepo 참고
date: '2023-06-25'
tags: ['frontend', 'turborepo']
draft: false
summary: 'Turborepo 참고 링크 정리'
---

Turborepo 참고 링크 정리

### 참고

* LINE - Turborepo로 모노레포 개발 경험 향상하기 : https://engineering.linecorp.com/ko/blog/monorepo-with-turborepo

* Naver d2 turborepo : https://d2.naver.com/helloworld/7553804#ch4

* Turborepo + yarn-berry 모노레포 구축기 : https://velog.io/@otterji/Turborepo-yarn-berry-%EB%AA%A8%EB%85%B8%EB%A0%88%ED%8F%AC-%EA%B5%AC%EC%B6%95%EA%B8%B0

* youtube - Turborepo Tutorial | Part 1 - Typescript, Eslint, Tailwind, Husky shared config setup in a Monorepo : https://www.youtube.com/watch?v=YQLw5kJ1yrQ


### turborepo 공식문서
* Running Tasks : https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks
* Filtering Workspaces : https://turbo.build/repo/docs/core-concepts/monorepos/filtering

`turbo-ignore` 를 통해 변경이 발생한 project만 빌드를 수행할 수 있는 것으로 보인다.
 * https://github.com/vercel/turbo/blob/main/packages/turbo-ignore/README.md
 * https://vercel.com/changelog/intelligent-ignored-builds-using-turborepo
 * https://turbo.build/repo/docs/core-concepts/monorepos/skipping-tasks
 * https://vercel.com/docs/concepts/projects/overview#ignored-build-step

### turborepo example

* fullstack sample gitHub : https://github.com/taneba/fullstack-graphql-app

* vercel turbo examples : https://github.com/vercel/turbo/tree/main/examples
