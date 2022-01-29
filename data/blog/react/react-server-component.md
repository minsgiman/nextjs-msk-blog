---
title: React Server Component(RSC) 소개
date: '2022-01-29'
tags: ['react']
draft: false
summary: 'RSC는 무엇이고 기존의 SSR과는 어떻게 다른지 살펴본다.'
---

NextJS 12에서도 React Server Component(RSC) 를 지원한다고 한다. <br />
RSC는 무엇이고 기존의 SSR과는 어떻게 다른지 살펴본다.

### 기존 SSR과 동작 비교

기존 SSR 방식은 다음과 같이 동작한다.

```js
// ES modules
import ReactDOMServer from 'react-dom/server'

ReactDOMServer.renderToString(element)
```

`renderToString` 함수를 통해 초기 렌더링 결과를 HTML로 반환하고, 이를 바탕으로 첫 요청의 응답으로 마크업을 포함한 HTML문서를 사용자에게 빠르게 보여준다. <br />
그리고 클라이언트단에서 ReactDOM.hydrate 함수를 통해 바뀐 부분만 수분을 공급해준다.

![object](/static/images/ssr-render.png 'object')

#### 일반적인 컴포넌트

1. 검색창에 뭔가 입력
2. onChange => 검색 Fetch => 검색결과 받아옴
3. 받은 검색 결과 리액트에 넘겨서 컴포넌트 렌더링

#### RSC

1. 검색창에 뭔가 입력
2. onChange => 렌더링 서버에 키워드 Fetch (키워드는 서버 컴포넌트의 props가 된다.) =>
3. 서버에서 검색 Fetch 요청 보냄 => 검색결과 받아서 렌더링 결과를 (HTML, JSON이 아닌 특별한 포맷) 클라이언트로 stream 한다.
4. 클라이언트에서 렌더링 결과를 받아 정적 UI로 렌더링

<br />

위에서 본 기존 SSR은 page 단위로 동작한다. <br />
서버 사이드에서 호출하는 API가 많으면 그만큼 렌더링이 지연되고, page 번들 사이즈가 커질수록 hydration 과정이 느려지면서 상호작용이 지연된다. <br />

RSC는 기존 page 단위의 SSR을 컴포넌트 단위로 분리가 가능하게 해주며 서버 컴포넌트는 streaming 으로 내려받게 해주어, 먼저 그릴 수 있는 부분은 먼저 그리며 상호작용이 가능한 부분은 더 빠르게 할 수 있도록 해준다. <br />

기존 SSR이 초기렌더링 시에만 동작했다면, RSC는 컴포넌트 props가 변경될 때도 다시 요청하여 렌더링 결과를 refetch 한다. <br />
RSC 에서는 다음과 같은 특별한 포맷으로 렌더링 결과를 전송한다.

![object](/static/images/react-server-component-render.png 'object')

RSC는 Client 사이드 번들에 포함되지 않는다. 서버 컴포넌트에서만 사용되는 라이브러리 모듈은 서버 사이드에서만 사용하면 된다. <br />
그만큼 번들 사이즈가 줄어듬으로써, 기존 SSR에서 hydration 과정이 길어지면서 상호작용이 지연되는 문제가 개선될 수 있을 것으로 보인다. <br />
참고 : [Introducing Zero-Bundle-Size React Server Components](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html)

<br />

### client 컴포넌트 vs server 컴포넌트

RSC를 사용하면 클라이언트, 서버 컴포넌트 두 종류가 생긴다. <br />
어떤 컴포넌트는 서버에서 렌더링되고, 어떤 컴포넌트는 클라이언트에서 렌더링 될 수 있다.

![object](/static/images/react-element-tree.png 'object')

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
import db from 'db.server'
// (A1) We import from NoteEditor.client.js - a Client Component.
import NoteEditor from 'NoteEditor.client'

function Note(props) {
  const { id, isEditing } = props
  // (B) Can directly access server data sources during render, e.g. databases
  const note = db.posts.get(id)

  return (
    <div>
      <h1>{note.title}</h1>
      <section>{note.body}</section>
      {/* (A2) Dynamically render the editor only if necessary */}
      {isEditing ? <NoteEditor note={note} /> : null}
    </div>
  )
}
```

서버 컴포넌트는 직접 DB에 접근하여 데이터를 받아올 수 있다. 그리고 받아온 데이터를 바탕으로 NoteEditor라는 클라이언트 컴포넌트를 구성한다. <br />
**서버 컴포넌트가 클라이언트 컴포넌트를 import 할 때는, React.lazy와 같은 처리가 필요없이 자동적으로 필요로 할 때 dynamic하게 import를 하게된다.** <br />
client 컴포넌트들은 자동적으로 코드 스플리팅이 적용되어 렌더링이 필요한 시점에 lazy하게 import 된다.

<br />

#### NoteEditor.client.js

```js
export default function NoteEditor(props) {
  const note = props.note
  const [title, setTitle] = useState(note.title)
  const [body, setBody] = useState(note.body)
  const updateTitle = (event) => {
    setTitle(event.target.value)
  }
  const updateBody = (event) => {
    setTitle(event.target.value)
  }
  const submit = () => {
    // ...save note...
  }

  return (
    <form action="..." method="..." onSubmit={submit}>
      <input name="title" onChange={updateTitle} value={title} />
      <textarea name="body" onChange={updateBody}>
        {body}
      </textarea>
    </form>
  )
}
```

클라이언트 컴포넌트는 state, effects, DOM 접근 등을 할 수 있다. <br />
또한 **서버 컴포넌트가 다시 렌더링된다고 하더라도, 클라이언트 컴포넌트가 기존에 가지고 있었던 DOM과 state들은 유지가 된다. (정확히 말하자면, 서버에서 내려주는 props를 바탕으로 머지된다.)**

---

### 참조

[React 서버 컴포넌트 / RSC의 도입 배경과 장점](https://programming119.tistory.com/252)

[React Server Component(RSC) 소개](https://nookpi.tistory.com/35)

[React Server Components overview](https://shopify.dev/custom-storefronts/hydrogen/framework/react-server-components)

[What you need to know about React Server Components](https://blog.logrocket.com/what-you-need-to-know-about-react-server-components/)
