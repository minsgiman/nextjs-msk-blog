---
title: React Server Component Demo 사용해보기
date: '2022-07-30'
tags: ['react']
draft: false
summary: 'React Server Component Demo를 사용해보고 어떻게 동작하는지 확인해본다.'
---

## 목표

[React Server Component Demo](https://github.com/reactjs/server-components-demo)를 사용해보고 어떻게 동작하는지 확인해본다. <br />
아직 개발중인 feature이기 때문에 Demo를 보았을때 최적화 되어 있지 않거나 실제 프로젝트에서는 사용하기 어려운 부분들이 있지만, 추후에 개선될 것으로 보고 RSC(React Server Component)가 어떻게 동작하는지 파악하기 위한 목적으로 진행한다.

## Demo앱 페이지 렌더링 과정

#### 1. 초기번들 내려받기 (index.html → main.js)

- main.js 번들에는 react 를 포함하여 [RSC wire format(React Tree 정보)](https://www.plasmic.app/blog/how-react-server-components-work#the-rsc-wire-format)을 서버로부터 fetch하여 실제 React Tree를 만드는 [react-server-dom-webpack](https://github.com/facebook/react/tree/main/packages/react-server-dom-webpack) 모듈도 포함되어 있다.
- main.js 번들에는 또한 서버 컴포넌트 prop이 변경될 때 바뀐 prop으로 렌더링 서버로 렌더링 결과를 refetch 하는 코드도 같이 포함되어 있다.

#### 2. 현재 페이지의 React Tree 정보 요청

- main.js에서 현재 페이지의 React Tree 정보를 렌더링 서버로 요청한다.

<img src="/static/images/rsc-server-tree.png" width="400" />

- 데모에서는 React Tree 정보 요청시 query로 Root server component의 props를 전달하고 있다.
  - 요청path : /react?location=%7B%22selectedId%22%3Anull%2C%22isEditing%22%3Afalse%2C%22searchText%22%3A%22%22%7D

#### 3. server에서 React Tree 정보 (RSC wire format)를 build하여 Stream으로 전달

서버([api.server.js](https://github.com/reactjs/server-components-demo/blob/main/server/api.server.js))로 React Tree 정보에 대한 요청이 들어오면 `react-server-dom-webpack/writer`의 **_renderToPipeableStream_**을 통해 렌더링을 위한 stream을 생성하여 response로 보낸다. <br />

```js
async function renderReactTree(res, props) {
  await waitForWebpack();
  const manifest = readFileSync(
    path.resolve(__dirname, '../build/react-client-manifest.json'),
    'utf8'
  );
  const moduleMap = JSON.parse(manifest);
  const { pipe } = renderToPipeableStream(React.createElement(ReactApp, props), moduleMap);
  pipe(res);
}
```

위에서 본 renderToPipeableStream 의 파라미터로는 **Root Server Component, Props, Client컴포넌트 Map**이 전달된다. <br />
Root Server Component + Props + Client컴포넌트 Map 으로 다음의 React tree 를 만들고 이를 RSC wire format 데이터로 stream을 통해 client로 전달한다.

<img src="/static/images/react-server-components-placeholders.png" width="400" />

#### 4. client에서 React Tree 정보를 전달받아 React Tree rebuild → 렌더링

위에서 본 React tree를 RSC wire format으로 전달하는데, 살펴 보면 다음과 같다. <br />
client component 청크에 대한 정보와 함께 J로 시작하는 부분에는 server component로 부터 시작하는 react tree 정보가 들어있다.

<img src="/static/images/rsc-wire-format.png" />

react tree 정보를 펼처보면 server component는 HTML tag 로 렌더링 되었고, client component 부분에는 컴포넌트 id가 들어있다.

<img src="/static/images/rsc-format-data.png" width="300" />

HTML이 아닌 RSC format으로 전달하는 이유는 client에서 React Tree를 재구성하기에 더 적합하기 때문이다. <br />
해당 정보로 client에서 React Tree를 재구성하고 변경된 부분만 DOM에 업데이트 한다.

#### 5. client 컴포넌트 dynamic import

위에서 전달받은 정보를 참고하여 client component 번들은 dynamic import로 내려받는다. → 점진적 hydration

demo에서는 모든 client component 각각마다 번들파일을 따로 구성하는데, 이는 번들분리를 최적화할 수 있는 방법으로 추후 개선될 것으로 보인다.

<img src="/static/images/rsc-client-component.png" />

<br />

## 렌더링 업데이트 triger by client

#### 1. input에 검색어 입력 -> server로 변경된 component prop과 함께 React Tree 정보 재요청

다음과 같이 input에 검색값을 넣으면서 변경된 Server component의 prop을 렌더링 결과를 refetch 할 때 전달한다.

<img src="/static/images/rsc-search.png" width="500" />

데모 앱에서는 단순히 onChange에서 변경된 value를 구독하여 렌더링 서버로 fetch 요청을 보내고 있다.

- 요청path : /react?location=%7B%22selectedId%22%3Anull%2C%22isEditing%22%3Afalse%2C%22**searchText%22%3A%22%22%7D**

데모앱에서 이와 관련된 코드는 다음을 참고한다.

- [Cache.client.js](https://github.com/reactjs/server-components-demo/blob/main/src/Cache.client.js)
- [Root.client.js](https://github.com/reactjs/server-components-demo/blob/main/src/Root.client.js)

현재 데모에서는 바뀐 server component만 요청하지 않고, 항상 Root Component 부터 React Tree 전체를 새로 요청하고 있는데.. 이 부분은 추후에 개선될 것으로 보인다.

#### 2. 렌더링 업데이트

이후는 위의 페이지 렌더링 과정 3~5번과 동일하다. <br />
이 때 기존의 client 컴포넌트가 가지고 있던 client-side state들은 유지가 된다. 렌더링 업데이트 되는 부분은 기존 React Tree에 merge된다.

<br />

## 추후 개선될 내용들

#### 1. SSR과 같이 지원.

위에서 살펴본 동작방식을 보았을때 RSC는 SSR을 완전히 대체하지는 못한다. SSR + RSC 형태로 같이 사용할 수 있도록 준비중이다.

#### 2. 효율적인 client 컴포넌트 번들링 전략

현재 client 컴포넌트 각각마다 자동으로 하나의 JS번들이 분리되고 있는데, 이는 추후에 더 효율적인 번들링 전략을 사용할 수 있도록 개선될 것으로 보인다.

#### 3. 변경된 부분만 refetch

현재 렌더링결과 refetch를 요청할때 변경된 부분만 요청하지 않고, 페이지 전체를 다시 요청한다. <br />
변경된 컴포넌트에 대해서만 요청하도록 추후에 개선될 것으로 보인다.

#### RSC 개선을 위해 추가로 진행중인 내용은 [open-areas-of-research](https://github.com/josephsavona/rfcs/blob/server-components/text/0000-server-components.md#open-areas-of-research) 를 참고한다.

<br />

---

### 참조

- [React Server Component Demo](https://github.com/reactjs/server-components-demo)
- [How React server components work](https://blog.plasmic.app/posts/how-react-server-components-work/)
- [RFC: React Server Components](https://github.com/josephsavona/rfcs/blob/server-components/text/0000-server-components.md)
