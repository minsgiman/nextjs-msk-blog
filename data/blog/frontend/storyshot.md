---
title: storybook addon storyshot 활용
date: '2021-09-20'
tags: ['storybook', 'test', 'frontend']
draft: false
summary: 'storyshot은 storybook 공식 애드온으로 작성된 story에 대한 html형태의 스냅샷을 생성하고, 이전 스냅샷과 비교한다.'
---

프로젝트의 atomic 컴포넌트부터 page(혹은 template)단위의 컴포넌트까지 모든 화면의 UI component story를 작성하였다.

그런데 코드 수정을 할때마다 기존에 작성한 UI component story에 의도하지 않은 변화가 발생하지는 않았을지 걱정된다.

눈으로 모든 Story를 일일히 확인하는 것은 너무 오랜 시간이 걸린다.

**바로 의도하지 않은 UI 변경이 발생하지 않았는지 Visual Test를 수행하는 것이 storyshot 의 역할이다.**

storyshot은 storybook 공식 애드온으로 작성된 story에 대한 html형태의 스냅샷을 생성하고, 이전 스냅샷과 비교한다.

다음은 storyshot을 수행하면 생성되는 story에 대한 스냅샷이다.

```
exports[`Storyshots TaskInput default 1`] = `
<div
  className="TaskInput-container"
>
  <div
    className="TaskInput"
  >
    <input
      className="TaskInput-input"
      onChange={[Function]}
      placeholder="Please input your task"
      type="text"
      value=""
    />
```

storyshot을 실행했을 때 이전의 스냅샷과 다르다면 **예상치 못한 변화** 혹은 **스냅샷이 UI component의 새로운 버전으로 업데이트 되어야 할 때**를 의미한다. (실행 결과에 다른 부분에서 Failed가 나올 것이다.)

의도된 변경이라면 `-u`를 붙여서 스냅샷을 업데이트한다.

```
yarn run test:storybook
yarn run test:storybook -u
```

#### 테스트 설정

다음은 storyshot 테스트 설정이다. jest로 작성한 **storyshot.test.js** 테스트를 실행하면 story들에 대한 snapshot이 생성된다.

자세한 설정 방법은 아래 페이지를 참고한다.

- [addon-storyshots](https://www.npmjs.com/package/@storybook/addon-storyshots)
- [Snapshot testing with Storybook](https://storybook.js.org/docs/react/workflows/snapshot-testing)

```js
/* storyshot.test.js */
import path from 'path'
import initStoryshots, {
  multiSnapshotWithOptions,
  Stories2SnapsConverter,
} from '@storybook/addon-storyshots'

const resolve = (...dir) => path.resolve(process.cwd(), ...dir)

initStoryshots({
  configPath: resolve('.storybook'),
  // to create the sparate snashot file on each dir
  test: multiSnapshotWithOptions({}),
  // to change the snapshot file extention
  stories2snapsConverter: new Stories2SnapsConverter({
    snapshotsDirName: '__snapshots__',
    snapshotExtension: '.snap.js',
    storiesExtensions: ['.js', '.tsx'],
  }),
})
```

#### Storyshot disable

어떤 story들은 snapshot이 불가능하거나 어렵다. (랜덤한 값이 생성되거나 store로부터 그려야 할 데이터를 가져오는 경우)

이러한 경우 다음과 같이 각 story 별로 parameters에 disable을 설정해주면 snapshot이 생성되지 않는다.

```js
Exception.parameters = {
  storyshots: { disable: true },
}
```
