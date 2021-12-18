---
title: Prefetch Component in React
date: '2020-11-11'
tags: ['react']
draft: false
summary: 'Prefetch는 브라우저가 idle time에 미래에 사용될 리소스들을 미리 다운로드 받아서 캐시하여, 미래에 방문할 페이지의 로딩 속도를 빠르게 해주는 기능이다.'
---

Prefetch는 브라우저가 idle time에 미래에 사용될 리소스들을 미리 다운로드 받아서 캐시하여, 미래에 방문할 페이지의 로딩 속도를 빠르게 해주는 기능이다.

언제 어떻게 Prefetch를 할지는 다음과 같이 나눌 수 있다.

- **Prefetch all** : 모든 async chunk를 prefetch
- **Prefetch by dependency** : 부모 chunk를 로드할 때 prefetch
- **Visible links** : 다음에 이동할 Page의 link가 보이면, 즉 link 컴포넌트가 mount될 때
- **On mouse over** : link를 클릭하기 전 mouse over 할 때

<br />

#### Prefetch all

[preload-webpack-plugin](https://github.com/GoogleChromeLabs/preload-webpack-plugin)을 사용하여 prefetch 를 적용한다. <br />
include 옵션을 "asyncChunks" 로 설정하게 되면 모든 async script chunks 들을 prefetch로 다운로드 하게 된다.

```js
// webpack.config.base.js
const PreloadWebpackPlugin = require('preload-webpack-plugin');

plugins: [
  new PreloadWebpackPlugin({
    rel: 'prefetch',
    include: 'asyncChunks',
  }),
```

이 방법은 Page수가 많은 앱에서는 초기에 너무많은 네트워크 요청을 하게되어 초기 렌더링에 안 좋은 영향을 미치게 된다. <br />
또한 처음에 진입해서 그려야 할 페이지도 prefetch로 불러오게 될 수 있다.

<br />

#### Prefetch by dependency

다음과 같이 [Webpack magic-comments](https://webpack.js.org/api/module-methods/#magic-comments)를 통해서 개별로 prefetch를 설정할 수 있다.

```js
import(/* webpackPrefetch: true */ 'module')
```

이 방법은 위의 webpackPrefetch 를 설정해놓은 부모 청크가 로드 될 때 prefetch한다. <br />
하지만 아래와 같이 **prefetch 타이밍을 지정할 수 없다. 항상 부모 청크가 로드 될 때 바로 prefetch 한다.** <br />
이에 대한 설명은 다음 링크를 참조한다. [Prefetch — Take control from webpack](https://migcoder.medium.com/prefetch-preload-take-control-from-webpack-26d1e0f2c3) <br />
또한 prefetch 된 청크안에 또 prefetch가 정의되어 있으면 재귀적으로 prefetch가 되어 의도하지 않게 동작할 수 있다.

```js
// not work, always prefetch when chunk load
const handleClick = () => {
  import(/* webpackPrefetch: true */ './pageA.js')
}
```

<br />

#### Visible links, On mouse over

위에서 본 webpack에서 지원하는 방법으로는 prefetch가 원하는 대로 동작하지 않았다. <br />
또한 prefetch 는 IOS에서는 현재 지원하지 않는다. <br />
그래서 직접 lazy load를 호출하는 방식으로 구현한다. 다음의 링크를 참조하였다. [Lazy loading components](https://medium.com/hackernoon/lazy-loading-and-preloading-components-in-react-16-6-804de091c82d) <br />
현재 Page가 마운트 되었을 때, mouse over시에 다음에 이동할 Page를 미리 lazy load 한다.

```js
// PageRoute.js

const lazyImport = {
  PageA: () => import(/* webpackChunkName: "PageA" */ 'PageA.js'),
  PageB: () => import(/* webpackChunkName: "PageB" */ 'PageB.js'),
  PageC: () => import(/* webpackChunkName: "PageC" */ 'PageC.js'),
}

let PageA, PageB, PageC

retryableLazy(lazyImport.PageA, (component) => {
  PageA = component
})

retryableLazy(lazyImport.PageB, (component) => {
  PageB = component
})

retryableLazy(lazyImport.PageC, (component) => {
  PageC = component
})

export default function PageRoute() {
  return (
    <Switch>
      <Route exact path={Routes.PageA} render={() => <PageA lazyImport={lazyImport.PageB} />} />
      <Route path={Routes.PageB} render={() => <PageB lazyImport={lazyImport.PageC} />} />
      <Route path={Routes.PageC} component={PageC} />
    </Switch>
  )
}
```

```js
// PageA.js

export default function PageA({ lazyImport }) {
  // ...

  useEffect(() => {
    // ...
    lazyImport?.() // lazy import when mounted
  }, [])

  // ...
}
```

```js
// PageB.js

export default function PageB({ lazyImport }) {
  // ...

  const handleMouseOver = useCallback(() => {
    // ...
    lazyImport?.() // lazy import when mouse over
  }, [])

  // ...
}
```

결론은 Webpack에서 지원하는 방법은 다음과 같은 이유로 사용할 수 없었다.

- 원하는 타이밍에 prefetch를 하도록 컨트롤 불가능
- 필요한 chunk만 골라서 prefetch 하는 데 어려움
- IOS에서 prefetch를 지원안함

그래서 직접 lazy load를 호출하는 방법을 통해 원하는 타이밍에 필요한 chunk를 미리 로드하는 방법이 대안으로 보인다.

---

### 참조

- [webpack prefetch](https://webpack.kr/guides/code-splitting/#prefetchingpreloading-modules)

- [Prefetch — Take control from webpack](https://migcoder.medium.com/prefetch-preload-take-control-from-webpack-26d1e0f2c3)

- [Lazy loading components](https://medium.com/hackernoon/lazy-loading-and-preloading-components-in-react-16-6-804de091c82d)
