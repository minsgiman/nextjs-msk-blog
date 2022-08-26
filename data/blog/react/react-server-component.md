---
title: React Server Component(RSC) 소개
date: '2022-01-29'
tags: ['react']
draft: false
summary: 'RSC는 무엇이고 왜 등장하게 되었는지, 어떻게 사용하는지 살펴본다.'
---

NextJS 12에서도 React Server Component(RSC) 를 지원한다고 한다. (alpha버전) <br />
RSC는 무엇이고 왜 등장하게 되었는지, 어떻게 사용하는지 살펴본다.

### React Server Component 란?

[React Server Component](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html) 이전에, 모든 React Component는 브라우저에서 실행되어야 했다. <br />
컴포넌트 코드를 모두 브라우저에서 내려받아 React element tree를 구성하고 DOM에 렌더링하는 과정을 거쳤고, SSR을 사용한다면 [hydrate](https://ko.reactjs.org/docs/react-dom.html#hydrate) 과정을 거쳤다. <br />

RSC는 Server에서만 실행되고 렌더링 결과만 브라우저로 전달하는 컴포넌트이다. <br />
Server에서 실행되기 때문에 브라우저에서 코드를 내려받고 실행하지 않아도 된다. 렌더링 결과만 서버로부터 전달받는다.

### React Server Component 의 장점은?

#### data fetch가 빠르게 이루어진다.

서버에서 직접 DB, 파일시스템등에 접근하여 data를 가져오기 때문에 브라우저에서 요청하는것 보다 빠르게 이루어진다.

#### package 모듈 사용비용이 적다.

서버에서는 package 모듈을 사용할 때마다 다운로드할 필요가 없기 때문에 브라우저 보다 사용비용이 적다. <br />
브라우저에서 size가 큰 package는 성능에 영향을 준다.

#### client 번들 사이즈 최소화

RSC는 Client 사이드 번들에 포함되지 않는다. 서버 컴포넌트에서만 사용되는 라이브러리 모듈은 서버 사이드에서만 사용하면 된다. <br />

#### Suspense와 함께 컴포넌트 단위로 점진적인 렌더링, 상호작용을 가능하게 해준다.

기존 SSR은 page 단위로 동작한다. 서버 사이드에서 호출하는 API가 많으면 그만큼 렌더링이 지연되고, page 번들 사이즈가 커질수록 hydration 과정이 느려지면서 상호작용이 지연된다. <br />
RSC는 Suspense와 함께 서버 렌더링이 컴포넌트 단위로 분리가 가능하게 해준다. <br />
렌더링 결과를 streaming할 수 있는 [RSC Wire Format](https://blog.plasmic.app/posts/how-react-server-components-work/#the-rsc-wire-format)으로 전달하여 먼저 그릴 수 있는 부분은 먼저 그릴 수 있도록 해준다.

<br />

### client 컴포넌트 vs server 컴포넌트

RSC를 사용하면 클라이언트, 서버 컴포넌트 두 종류가 생긴다. <br />
어떤 컴포넌트는 서버에서 렌더링되고, 어떤 컴포넌트는 클라이언트에서 렌더링 되어 다음과 같이 tree를 구성한다.

![object](/static/images/react-server-components.png 'object')

- 서버 컴포넌트

  - \*.sever.js(jsx, ts, tsx)
  - data를 fetch하고 렌더링하는 과정이 서버에서 이루어진다. 클라이언트로 렌더링 결과를 전송한다.
  - client 전송 번들에 포함되지 않는다.
  - client-side interaction 코드를 포함하지 않는다. (RSC안에 클라이언트 컴포넌트를 넣는 구조로 상호작용을 가능하게 한다.)
  - useState, useReducer 와 같은 client-side state 코드를 사용할 수 없다.

- 클라이언트 컴포넌트

  - \*.client.js(jsx, ts, tsx)
  - client-side 에서 렌더링이 이루어진다.
  - client-side state 코드를 사용할 수 있다.
  - client-side interaction 코드를 포함한다.

<br />

서버 사이드에서는 다음과 같이 브라우저로 보내기 위한 React tree (Root 컴포넌트가 RSC인) 를 만든다. <br />
이 때 client component 자리에는 컴포넌트 정보를 가지고 있는 placeholder를 넣는다.

![object](/static/images/react-server-components-placeholders.png 'object')

이제 브라우저에서 서버에서 전송한 내용을 받아 placeholder를 client component로 채워 React tree를 재구성한다.

![object](/static/images/react-server-components-client.png 'object')

<br />

### 기존 SSR과 동작 비교

기존 SSR 방식은 다음과 같이 동작한다.

```js
// ES modules
import ReactDOMServer from 'react-dom/server';

ReactDOMServer.renderToString(element);
```

`renderToString` 함수를 통해 초기 렌더링 결과를 HTML로 반환하고, 이를 바탕으로 첫 요청의 응답으로 마크업을 포함한 HTML문서를 사용자에게 빠르게 보여준다. <br />
그리고 클라이언트단에서 ReactDOM.hydrate 함수를 통해 바뀐 부분만 수분을 공급해준다.

![object](/static/images/ssr-render.png 'object')

기존 SSR이 초기렌더링 시에만 동작했다면, RSC는 컴포넌트 props가 변경될 때도 다시 요청하여 렌더링 결과를 refetch 한다. <br />

#### 일반적인 컴포넌트

1. 검색창에 뭔가 입력
2. onChange => 검색 Fetch => 검색결과 받아옴
3. 받은 검색 결과 리액트에 넘겨서 컴포넌트 렌더링

#### RSC

1. 검색창에 뭔가 입력
2. onChange => 렌더링 서버에 키워드 Fetch (키워드는 서버 컴포넌트의 props가 된다.) =>
3. 서버에서 검색 Fetch 요청 보냄 => 검색결과 받아서 렌더링 결과를 (HTML, JSON이 아닌 특별한 포맷 - RSC Wire Format) 클라이언트로 전송한다.
4. 클라이언트에서 렌더링 결과를 받아 정적 UI로 렌더링

<br />

### 사용예시

#### NoteList.server.js

```js
import {fetch} from 'react-fetch';

import {db} from './db.server';
import SidebarNode from './SidebarNote';

export default function NoteList({searchText}) {
    const notes = db.query(
        `SELECT * FROM notes WHERE title ilike $1 order by updated_at desc`,
        ['%' + searchText + '%']
    ).rows;

    return notes.lenth > 0 ?(
        //...
    ) : (
        //...
    );
}
```

#### Note.server.js

```js
import db from 'db.server';
// (A1) We import from NoteEditor.client.js - a Client Component.
import NoteEditor from 'NoteEditor.client';

function Note(props) {
  const { id, isEditing } = props;
  // (B) Can directly access server data sources during render, e.g. databases
  const note = db.posts.get(id);

  return (
    <div>
      <h1>{note.title}</h1>
      <section>{note.body}</section>
      {/* (A2) Dynamically render the editor only if necessary */}
      {isEditing ? <NoteEditor note={note} /> : null}
    </div>
  );
}
```

서버 컴포넌트는 직접 DB에 접근하여 데이터를 받아올 수 있다. 그리고 받아온 데이터를 바탕으로 NoteEditor라는 클라이언트 컴포넌트를 구성한다. <br />
**서버 컴포넌트가 클라이언트 컴포넌트를 import 할 때는, React.lazy와 같은 처리가 필요없이 자동적으로 필요로 할 때 dynamic하게 import를 하게된다.** <br />
client 컴포넌트들은 자동적으로 코드 스플리팅이 적용되어 렌더링이 필요한 시점에 lazy하게 import 된다.

<br />

#### NoteEditor.client.js

```js
export default function NoteEditor(props) {
  const note = props.note;
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const updateTitle = (event) => {
    setTitle(event.target.value);
  };
  const updateBody = (event) => {
    setTitle(event.target.value);
  };
  const submit = () => {
    // ...save note...
  };

  return (
    <form action="..." method="..." onSubmit={submit}>
      <input name="title" onChange={updateTitle} value={title} />
      <textarea name="body" onChange={updateBody}>
        {body}
      </textarea>
    </form>
  );
}
```

클라이언트 컴포넌트는 state, effects, DOM 접근 등을 할 수 있다. <br />
또한 **서버 컴포넌트가 다시 렌더링된다고 하더라도, 클라이언트 컴포넌트가 기존에 가지고 있었던 DOM과 state들은 유지가 된다. (정확히 말하자면, 서버에서 내려주는 props를 바탕으로 머지된다.)**

<br />

#### Suspense 와 함께 사용

```js
// Tweets.server.js
import { fetch } from 'react-fetch'; // React's Suspense-aware fetch()
import Tweet from './Tweet.client';
export default function Tweets() {
  const tweets = fetch(`/tweets`).json();
  return (
    <ul>
      {tweets.slice(0, 2).map((tweet) => (
        <li>
          <Tweet tweet={tweet} />
        </li>
      ))}
    </ul>
  );
}

// Tweet.client.js
export default function Tweet({ tweet }) {
  return <div onClick={() => alert(`Written by ${tweet.username}`)}>{tweet.body}</div>;
}

// OuterServerComponent.server.js
export default function OuterServerComponent() {
  return (
    <ClientComponent>
      <ServerComponent />
      <Suspense fallback={'Loading tweets...'}>
        <Tweets />
      </Suspense>
    </ClientComponent>
  );
}
```

Suspense는 Tweets 서버 컴포넌트에서 사용하는 react-fetch가 진행중인지 알 수 있어서 fallback 처리가 가능하다. <br />
그리고 클라이언트 컴포넌트 내부에서는 서버 컴포넌트를 import할 수 없고, 위 예제와 같이 children으로 합성(Composition)이 가능하다.

---

### 참조

[How React server components work](https://blog.plasmic.app/posts/how-react-server-components-work/)

[React 서버 컴포넌트 / RSC의 도입 배경과 장점](https://programming119.tistory.com/252)

[React Server Component(RSC) 소개](https://nookpi.tistory.com/35)

[React Server Components overview](https://shopify.dev/custom-storefronts/hydrogen/framework/react-server-components)

[What you need to know about React Server Components](https://blog.logrocket.com/what-you-need-to-know-about-react-server-components/)
