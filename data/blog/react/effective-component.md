---
title: 변경에 유연한 컴포넌트 만들기
date: '2022-09-13'
tags: ['react', 'frontend']
draft: false
summary: '변경에 유연한 컴포넌트를 만들기 위해서는 컴포넌트를 적절하게 분리해야 한다. 이를 위한 방법으로 다음 세가지를 정리한다.'
---

### 변경에 유연한 컴포넌트 만들기

변경에 유연한 컴포넌트를 만들기 위해서는 컴포넌트를 적절하게 분리해야 한다. <br />
이를 위한 방법으로 다음 세가지를 정리한다.

1. Headless 기반의 추상화하기 (hooks로 모듈화하기) <br />
   변하는 것 VS 상대적으로 변하지 않는 것

2. 각 컴포넌트는 한 가지 역할만 하고 합성(Composition)으로 컴포넌트를 조합하기

3. 도메인 분리하기 (도메인을 포함하는 컴포넌트와 그렇지 않은 컴포넌트 분리하기)

<br />

#### 1. Headless 기반의 추상화하기

아래의 예제에서 hooks로 모듈화하여 데이터 추상화와 동작 추상화를 하였다.

[데이터 추상화]

```js
export default function Calendar() {
  const { headers, body, view } = useCalendar();

  return (
    <Table>
      <Thead>
        {headers.weekDays.map(({ key, value }) => {
          return <Th key={key}>{format(value, 'E', { locale })}</Th>;
        })}
      </Thead>
      <Tbody>
        {body.value.map(({ key, value: days }) => (
          <Tr key={key}>{days}</Tr>
        ))}
      </Tbody>
    </Table>
  );
}
```

[동작 추상화]

```js
export function PressButton(props: Props) {
    const longPressProps = useLongPress();

    return <Button {...longPressProps} {...props} />
}

function useLongPress() {
    return {
        onKeyDown={e => {
            // ...
        }}
        onKeyUp={e => {
            // ...
        }}
        onMouseDown={e => {
            // ...
        }}
        onMouseUp={e => {
            // ...
        }}
    }
}
```

<br />

#### 2. 각 컴포넌트는 한 가지 역할만 하고 합성(Composition)으로 컴포넌트 조합하기

아래의 framework select UI를 구현하기 위해서 필요한 컴포넌트들이 각각 한가지 역할만 하고, 서로 합성을 통해 연결될 수 있도록 설계한다.

<img src="/static/images/component-divide.png" width="500" />

아래 예제에서 `Select`와 trigger로 전달된 `InputButton`은 서로의 존재에 대해 몰라도 된다. (커플링이 약하다.) <br />
이렇게 합성 가능 하도록 설계하고, 각 컴포넌트들이 한 가지 역할만 하도록 한다면 각 컴포넌트가 변경에 유연해진다.

```js
function Select({ label, trigger, value, onChange, options }: Props) {
  return (
    <Dropdown label={label} value={value} onChange={onChange}>
      <Dropdown.Trigger as={trigger} />
      <Dropdown.Menu>
        {options.map((option) => (
          <Dropdown.Item>{option}</Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}

function FrameworkSelect() {
  const {
    data: { frameworks },
  } = useFrameworks();
  const [selected, change] = useState();

  return (
    <Select
      trigger={<InputButton value={selected} />}
      value={selected}
      onChange={change}
      options={frameworks}
    />
  );
}
```

<br />

#### 3. 도메인 분리하기 (레이어링)

위에서 본 예제에서 `FrameworkSelect`는 데이터에 접근하며 비즈니스 로직을 가지고 있다. (도메인을 포함한다.) <br />
반면에 `Select`는 도메인을 모른다. <br />
따라서 FrameworkSelect에서 비즈니스 로직은 스스로 처리하되 UI로직은 위임하고 있다.

이렇게 도메인 로직을 가진 컴포넌트를 분리하는 것은 변경에 유연하게 대응할 수 있도록 한다.

<br />

### 컴포넌트를 분리하는 이유

컴포넌트를 분리하는 이유는 다음과 같다.

1. 컴포넌트를 분리하여 **복잡도를 낮춘다**.
2. **재사용** 가능한 컴포넌트를 만든다.

컴포넌트를 분리할때는 위의 이유중 어떤 이유로 분리하는지 잘 생각해보자. <br />
또한 컴포넌트를 분리하여 만들때는 내부 구현보다 컴포넌트의 인터페이스를 먼저 생각해보면 설계에 도움이 된다.

---

### 참조

- [Effective Component 지속 가능한 성장과 컴포넌트](https://www.youtube.com/watch?v=fR8tsJ2r7Eg)

- [React component as prop](https://www.developerway.com/posts/react-component-as-prop-the-right-way)

- [Applying SOLID principles in React](https://medium.com/dailyjs/applying-solid-principles-in-react-14905d9c5377)

- [(번역) React에 SOLID 원칙 적용하기](https://dev-boku.tistory.com/entry/%EB%B2%88%EC%97%AD-React%EC%97%90-SOLID-%EC%9B%90%EC%B9%99-%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0)
