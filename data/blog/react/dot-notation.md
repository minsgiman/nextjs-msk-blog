---
title: React Component 합성과 Dot Notation Exports
date: '2022-09-12'
tags: ['react']
draft: false
summary: 'dot notation export 패턴을 사용하여 modal component를 구현한 예제를 살펴본다.'
---

dot notation export 패턴을 사용하여 modal component를 구현한 예제를 살펴본다. <br />
예제에서는 Styled Components를 사용하였다.

```js
// Modal.js
import styled from 'styled-components';

export const Button = styled.button.attrs(() => ({ type: 'button' }))`
  // button styles
`;

export const Heading = styled.h2`
  // heading styles
`;

export const Body = styled.p`
  // body styles
`;

export const Wrap = styled.div`
  // outer modal styles
`;

Modal.Heading = Heading;
Modal.Body = Body;
Modal.Button = Button;

export function Modal({ isVisible, children }) {
  return <Wrap isVisible={isVisible}>{children}</Wrap>;
}
```

```js
// ParentComponent.js
import { useState } from 'react';
import { Modal } from '../components/Modal';

export function ParentComponent() {
  const [isModalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Modal isVisible={isModalVisible}>
        <Modal.Header>Hello, I am a Modal</Modal.Header>
        <Modal.Body>I can show helpful information</Modal.Body>
        <Modal.Button onClick={() => setModalVisible(false)}>Hide Modal</Modal.Button>
      </Modal>
      <button onClick={() => setModalVisible(true)} type="button">
        Show Modal
      </button>
    </>
  );
}
```

위의 예제의 ParentComponent에서는 `Modal`만 import하고 styled 컴포넌트들은 Modal 내부에 존재하여서 dot notation 으로 사용한다. <br />
이러한 dot notation pattern 사용은 다음과 같은 장점을 가진다.

<br />

### dot notation 패턴의 장점

#### 1. 제어의 역전(Inversion of control)

컴포넌트가 한 가지 책임만 지도록 적절히 분리해야 한다. <br />
그러면 Modal 컴포넌트는 모든 use case에 대해서 책임지지 않아도 된다. <br />
그 과정에서 dot notation 패턴을 사용할 수 있다.

아래 예제에서 Modal 컴포넌트는 props로 들어올 수 있는 모든 케이스를 핸들링해야 한다. props가 undefined인 경우 conditional rendering도 포함해서 말이다. <br />
Modal의 use-case가 확장된다면, 예를 들어 Link 또는 Icon 을 추가해야 한다면 Modal 내부의 로직이 더 늘어나게 된다. <br />
하지만 dot notation export 패턴을 사용한 예제에서는 단지 `<Modal.Icon>` 과 `<Modal.Link>`를 추가해주면 된다. <br />
그러면 Modal 컴포넌트는 children을 렌더링해줄 것이다. (React의 `children` prop을 통해 component composition(합성)을 한다.)

**Modal내부에 많은 로직을 두지 않고, 컴포넌트를 적절히 분리하여 Modal을 사용하는 곳에서 핸들링하도록 제어를 역전(Inversion of control) 시키도록 한다.**

```js
// Modal.js

export function Modal({ isVisible, header, body, buttonText, buttonOnClick }) {
  return (
    <Wrap isVisible={isVisible}>
      {header && <Header>{header}</Header>}
      {body && <Body>{body}</Body>}
      {button && <Button onClick={buttonOnClick}>{buttonText}</Button>}
    </Wrap>
  )
}

// ParentComponent.js
import { useState } from 'react'
import { Modal } from './Modal'

export function ParentComponent() {
  const [isModalVisible, setModalVisible] = useState(false)

  return (
    <>
      <Modal
        isVisible={isModalVisible}
        header="Hello, I am a Modal"
        body="I am receiving this data as props"
        buttonText="Ok"
        buttonOnClick={() => console.log('button clicked')}
      />
    </>
  )
```

#### 2. import를 적게 해도 된다.

필요한 모든 컴포넌트를 직접 import 하지 않고, Modal 하나만 import 해도된다.

```js
import { Modal } from '../components/Modal
```

아래와 같이 사용하는 대신 말이다.

```js
import { Modal, Heading, Button, Body } from '../components/Modal';
```

#### 3. Modal과 함께 사용하는 컴포넌트들의 위치를 같은 경로에 두게 된다.

dot notation을 사용하면 연관된 컴포넌트들끼리 같은 위치에 두는 것이 어느정도 강제화된다.

#### 4. JSX를 통해 Modal과 그 children 컴포넌트들이 연관되어 있음을 나타낸다.

우리는 다음 컴포넌트들이 연관되어 있음을 쉽게 추론할 수 있다.

```js
<Modal>
  <Modal.Heading>Heading</Modal.Heading>
  <Modal.Body>Body</Modal.Body>
  <Modal.Button>Button</Modal.Button>
</Modal>
```

아래와 같이 사용하는 것 보다 말이다.

```js
<Modal>
  <Heading>Heading</Heading>
  <Body>Body</Body>
  <Button>Button</Button>
</Modal>
```

#### 5. Typescript를 통해 authcomplete를 지원받을 수 있다.

`<Modal.` 와 같이 시작하면, typescript는 Modal에 assign되어 사용할 수 있는 컴포넌트 리스트를 보여줄 것이다. <br />
이것은 생산성을 높여준다.

<br />

### dot notation 예외

만일 위에서 본 Heading, Body, Button이 다른 곳에서도 사용된다면 Modal에 묶어서 dot notation export 패턴을 사용할 필요는 없다. <br />
그런 경우는 Modal이 아닌 공통 컴포넌트 위치에 구현하는게 맞을 것이다. <br />
오로지 Modal과 함께만 사용될 children만 Modal 내부에 dot notation을 통해 정의한다.

---

### 참조

- [React Component Composition with Dot Notation Exports](https://andreidobrinski.com/blog/react-component-composition-with-dot-notation-exports/)
