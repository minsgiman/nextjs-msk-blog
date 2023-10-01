---
title: jest test가 느릴 때 개선방법
date: '2023-09-28'
tags: ['jest', 'frontend', 'test']
draft: false
summary: '프로젝트에서 CI 과정 앞단의 Lint 에서 이미 수행 하고 있기때문에 중복 과정이라서 유닛 테스트시에는 full type-checking 과정을 제거하여 jest test 속도를 개선하였다.'
---

유닛 테스트 실행시 `ts-jest`로 typescript 컴파일할 때 기본 동작으로 full type-checking을 실행 하는데, 여기서 꽤 많은 시간을 차지한다. 

프로젝트에서 CI 과정 앞단의 Lint 에서 이미 수행 하고 있기때문에 중복 과정이라서 유닛 테스트시에는 full type-checking 과정을 제거하여 jest test 속도를 개선하였다.

`jest.config.js` 에서 `ts-jest`의 [문서](https://kulshekhar.github.io/ts-jest/docs/getting-started/options/isolatedModules/)에 설명된 `isolatedModules` 속성을 수정하였다.

* [isolatedModules을 true로 설정](https://huafu.github.io/ts-jest/user/config/isolatedModules#example)
      ```js
      // jest.config.js
      module.exports = {
        // [...]
        globals: {
          'ts-jest': {
            isolatedModules: true
          }
        }
      };
      ```

해당 옵션 변경만으로 다음과 같이 속도 개선이 있었다.

* AS-IS
  * unit: 12분24초
  * storyshot: 9분22초

* TO-BE
  * unit: 5분34초
  * storyshot: 2분10초

---

### 참조

- https://velog.io/@sehyunny/why-is-my-jest-test-suit-so-slow
- https://blog.bitsrc.io/why-is-my-jest-suite-so-slow-2a4859bb9ac0
