---
title: Effective 컴포넌트
date: '2022-09-12'
tags: ['react']
draft: false
summary: ''
---

### 컴포넌트 잘 만들기

변경에 유연하게 대응하도록

컴포넌트는

1. Headless 기반의 추상화하기
   변하는 것 VS 상대적으로 변하지 않는 것

2. 각 컴포넌트는 한 가지 역할만 하고 합성(Composition)으로 컴포넌트 조합하기
   또는 한 가지 역할만 하는 컴포넌트의 조합으로 구성하기

3. 도메인 분리하기
   도메인을 포함하는 컴포넌트와 그렇지 않은 컴포넌트 분리하기

#### 1. Headless UI 기반의 추상화하기

데이터 추상화

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

동작 추상화

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

#### 2. 각 컴포넌트는 한 가지 역할만 하고 합성(Composition)으로 컴포넌트 조합하기

---

https://www.developerway.com/posts/react-component-as-prop-the-right-way
