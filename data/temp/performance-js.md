페이지 로드 속도가 느린 성능 이슈가 보고되었습니다. <br>
성능 이슈의 주요 원인 중 하나는 초기 로딩시 사용하는 JS 번들 사이즈가 너무 큰 문제였습니다. <br>
JS 번들 사이즈가 크다면 파싱부터 실행까지 브라우저에서 처리하기 위한 비용이 커지고 이는 렌더링을 블로킹 하는 요소이기 때문에 페이지 로드 속도를 저하시킵니다. (특히 성능이 좋지 않은 저가 폰에서는..) <br>

이 글에서는 이번에 겪은 JS 번들 사이즈 관련 이슈들과 해결하기 위해 진행하였던 내용들에 대해서 정리해보았습니다. <br>

### 1. dynamic import 및 tree shaking 동작 안되는 문제 수정

#### [원인]

기존에 라우팅 단위로 번들을 분리하도록 구현되어 있습니다.<br>
그런데 tree shaking 이 동작하지 않고, dynamic import 로 지정한 컴포넌트들이 Entry 번들에서 분리되지 않고 있었습니다. 😱 <br>

원인은 babel 과 ts-loader의 modules 설정에 있습니다.<br>
다음과 같이 .babelrc 설정에서 [@babel/preset-env의 modules 옵션](https://babeljs.io/docs/en/babel-preset-env#modules)을 commonjs 로 기존에 사용하였습니다. <br>

```js
// .babelrc
"presets": [
    [
      "@babel/preset-env",
      {
        ...
        "modules": "commonjs" // "commonjs" -> false 로 수정함
      }
    ],
```

이 옵션을 **commonjs 로 설정하게 되면 babel이 트랜스파일링 하는 과정에서 esModule을 commonJS로 변환해버리게 됩니다.** <br>
그러면 Webpack에서는 code splitting과 tree shaking 을 하기 어렵게 됩니다.<br>

그 이유는 **commonJS의 require()가 가지고 있는 dynamic한 속성 때문입니다.** <br>
require()는 function, 조건문 등의 내부에서 마음대로 사용할 수 있고, 다음과 같은 lazy loading 패턴을 가능하게 합니다. <br>

```js
const http = require('http');

const addOrSubtract = (a, b, action = 'ADD') => {
  if (action === 'ADD') {
    return require('./add.js')(a, b);
  }

  if (action === 'SUBTRACT') {
    return require('./subtract.js')(a, b);
  }
};
```

이러한 commonJS의 속성은 번들러가 정적으로 모듈간의 의존성 파악과 사용하지 않는 부분들을 판단하기 어렵게 만들게 됩니다.
<br>

#### [수정]

그래서 위의 **modules 옵션을 "commonjs" -> false 로 변경**해서 commonJS 로 변환되지 않도록 하고,<br>
esModule에서 Webpack이 code splitting과 tree shaking 을 수행할 수 있도록 하였습니다.

<br>

위의 내용은 ts-loader를 사용할 때도 동일합니다.<br>

tsconfig.json 에서 [compilerOptions.module](https://www.typescriptlang.org/tsconfig#module) 도 **commonjs -> esnext**로 변경해주었습니다.<br>
참고로 dynamic import 구문까지 지원하려면 es6가 아닌 esnext(es2020)를 사용해야 합니다.<br>

```js
// tsconfig.json
{
  "compilerOptions": {
    ...
    "module": "commonjs", //"commonjs" -> "esnext" 로 변경
  },
```

<br>

### 2. prefetch 설정 제거

#### [prefetch 사용으로 인한 사이드 이펙트]

prefetch는 브라우저가 idle time에 미래에 사용될 리소스들을 미리 다운로드 받아서 캐시하여, 미래에 방문할 페이지의 로딩 속도를 빠르게 해주는 기능입니다.<br>
적절한 전략을 세워서 사용하면 좋습니다. 그렇지만 **잘 못 사용하게 되면 초기 렌더링 시간에도 안 좋은 영향을 주게 됩니다.** <br>

저희는 위의 1번 dynamic import 동작하지 않는 이슈를 수정하였음에도 LCP 수치가 개선되지 않아서 확인해보니 prefetch를 잘 못 사용한 원인이었습니다. <br>

기존에 아래와 같이 [preload-webpack-plugin](https://github.com/GoogleChromeLabs/preload-webpack-plugin)을 사용하여 prefetch 를 적용하였습니다. <br>
include 옵션을 "asyncChunks" 로 설정하게 되면 모든 async script chunks 들을 prefetch로 다운로드 하게 됩니다. <br>

```js
// webpack.config.base.js
const PreloadWebpackPlugin = require('preload-webpack-plugin');

plugins: [
  new PreloadWebpackPlugin({
    rel: 'prefetch',
    include: 'asyncChunks',
  }),
```

그 결과 "모든 async script chunks 들을 prefetch로 다운로드" + "라우팅 단위로 dynamic import 하기" 가 조합되어 **처음에 즉시 그려야 할 페이지 컴포넌트도 prefetch로 내려받게 되고, 이 때문에 초기 렌더링 완료 시간도 늦어지게 됩니다.** <br>
아래에서 보면 현재 그려야 할 SignIn 페이지의 chunk가 다른 prefetch 요청들과 섞여서 낮은 우선순위로 다운로드되고 있는 것을 확인 할 수 있습니다.
<br>

<img width="730" alt="prefetch" src="">

<br>

#### [수정]

그래서 저희는 prefetch를 추후에 적절한 전략이 있다면 사용하도록 하고 **당장은 prefetch를 사용하지 않도록 제거**하였습니다. <br>

만약 prefetch를 사용 한다면 필요한 리소스만 잘 선택하여 사용하는 것을 권장합니다. <br>
async script chunk를 선택해서 개별로 prefetch를 설정하는 방법은 다음과 같습니다. <br>

(Webpack [magic-comments](https://webpack.js.org/api/module-methods/#magic-comments))

```js
import(/* webpackPrefetch: true */ 'module');
```

(named chunk를 사용할 경우 preload-webpack-plugin의 include에 명시)

```js
plugins: [
  new PreloadWebpackPlugin({
    rel: 'preload',
    include: ['home'],
  }),
];
```

<br>

### 3. 라이브러리 Lazy Loading 적용

Size가 크면서 초기부터 로드할 필요가 없는, 어쩌면 사용되지 않을 라이브러리가 Entry 번들에 같이 포함되고 있었습니다. <br>
이러한 라이브러리에는 Lazy Loading을 적용하였습니다.<br>
그 중에 lottie 라이브러리의 사이즈는 무려 536kb 여서 svg 렌더러만 지원하는 light 버전(358kb)으로 변경하고, 다음과 같이 Lazy Loading을 적용하였습니다. <br>

```js
async function initLottie() {
  const lottie = await import(
    /* webpackChunkName: "lottie-light" */ 'lottie-web/build/player/lottie_light'
  );

  // ...
}
```

<br>

### 4. sub-path 페이지를 모두 포함하여 비효율적으로 구성된 Chunk 파일 작게 분리

번들을 분석하다보니 UI 시나리오가 분리되어 있음에도 불구하고, 상위 path가 같다는 이유로 하나의 번들파일로 묶여서 비효율적으로 chunk를 내려받는 경우가 있었습니다. <br>

예를 들어 다음의 'send', 'request', 'split', 'receiver', 'schedule' 들은 각각의 분리된 시나리오임에도 모두 묶어서 transfer chunk 파일 하나로 만들고 있었습니다.<br>
그러다 보니, 한 가지 기능만 사용하는데도 불필요하게 가져오는 script가 너무 컸습니다.

```
/transfer/send
/transfer/request
/transfer/split
/transfer/receiver
/transfer/schedule
```

위의 경우는 아래와 같이 transfer -> send, request, split, receiver, schedule 로 chunk를 분리하였습니다.

```js
const SendMoney = lazy(() =>
  import(/* webpackChunkName: "SendMoney" */ '@components/moneyTransfer/sendMoney/SendMoney')
);
const RequestToPay = lazy(() =>
  import(
    /* webpackChunkName: "RequestToPay" */ '@components/moneyTransfer/requestToPay/RequestToPay'
  )
);
const SplitBill = lazy(() =>
  import(/* webpackChunkName: "SplitBill" */ '@components/moneyTransfer/splitBill/SplitBill')
);
const Receiver = lazy(() =>
  import(/* webpackChunkName: "Receiver" */ '@components/moneyTransfer/receiver/Receiver')
);
const ScheduleTransfer = lazy(() =>
  import(
    /* webpackChunkName: "ScheduleTransfer" */ '@components/moneyTransfer/scheduleTransfer/ScheduleTransfer'
  )
);

export default function MoneyTransfer() {
  return (
    <Switch>
      <Route path={Routes.TRANSFER.SEND.index} component={SendMoney} />
      <Route path={Routes.TRANSFER.REQUEST.index} component={RequestToPay} />
      <Route path={Routes.TRANSFER.SPLIT.index} component={SplitBill} />
      <Route path={Routes.TRANSFER.RECEIVER.index} component={Receiver} />
      <Route path={Routes.TRANSFER.SCHEDULE.index} component={ScheduleTransfer} />
      <Redirect from="*" to={Routes.TRANSFER.SEND.index} />
    </Switch>
  );
}
```

참고로 분리한 여러 chunk 들이 공통으로 사용하는 모듈이 있다면 [Webpack optimization.splitChunks](https://webpack.js.org/plugins/split-chunks-plugin/#optimizationsplitchunks) 설정으로 공통으로 사용하는 모듈의 chunk를 따로 분리하여 중복으로 여러 chunk에 포함되지 않도록 설정할 수 있습니다.

<br>

### 5. development에서만 사용할 babel plugin이 production에서도 실행되는 문제

#### [이슈]

cypress coverage 측정을 위해 [babel-plugin-istanbul](https://github.com/istanbuljs/babel-plugin-istanbul)을 사용하고 다음과 같이 babel 설정에 추가하였습니다.

```js
//.babelrc

/* development 인 경우에만 Coverage 측정을 위해서 어떤 부분이 실행되는지 추적하기 위한 코드를 original 코드에 심는다. */
"env": {
  "development": {
    "plugins": ["istanbul"]
  }
}
```

그런데 coverage 측정을 위한 코드가 production 빌드시에도 주입되는 문제가 있었습니다. <br>

#### [원인 및 수정]

원인은 저희가 NODE_ENV를 설정하지 않고 build script 내부적으로 production 모드로 처리한 데 있습니다. <br>
**babel에서는 BABEL_ENV를 먼저 보고 그 다음 NODE_ENV를 보고 둘 다 설정 안되어 있으면 default로 'development' env를 사용하도록 되어 있습니다.** <br>
그렇기 때문에 명시적으로 NODE_ENV 를 설정하지 않으면 babel에서 'development' env 로 동작하게 됩니다. <br>
npm run build 시에 다음과 같이 NODE_ENV를 production 으로 설정하여 문제를 수정하였습니다. <br>

```
"build": "cross-env NODE_ENV=production node build/build.js"
```

<br>

### 개선 결과

JS 번들 관련 수정 외에도 페이지 로드 속도 개선을 위해 다음과 같은 수정사항 들이 있었고,

- CSS minified (1.4MB -> 337KB)
- 리소스 캐시 정책 수정 (1d -> 1m)
- image Lazy Loading 적용

위의 JS 번들 관련 3, 4번 수정 내용은 아직 배포 전이지만 현재 다음과 같이 리얼에서 전체적인 페이지 로드 속도가 개선되었습니다.

##### 개선 전 - 평균 페이지 로드 시간 (5.41초) <br>

<img width="800" alt="before-page-load" src="">

<br>

##### 개선 후 - 평균 페이지 로드 시간 (3.53초) <br>

<img width="800" alt="after-page-load" src="">
